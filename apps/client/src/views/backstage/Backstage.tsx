import { useEffect, useMemo, useState } from 'react';
import QRCode from 'react-qr-code';
import { useViewportSize } from '@mantine/hooks';
import { OntimeView, ProjectData } from 'ontime-types';
import { millisToString, removeLeadingZero } from 'ontime-utils';

import ProgressBar from '../../common/components/progress-bar/ProgressBar';
import Empty from '../../common/components/state/Empty';
import EmptyPage from '../../common/components/state/EmptyPage';
import TitleCard from '../../common/components/title-card/TitleCard';
import ViewLogo from '../../common/components/view-logo/ViewLogo';
import ViewParamsEditor from '../../common/components/view-params-editor/ViewParamsEditor';
import { useBackstageSocket, useClock } from '../../common/hooks/useSocket';
import { useWindowTitle } from '../../common/hooks/useWindowTitle';
import { cx, timerPlaceholderMin } from '../../common/utils/styleUtils';
import { formatTime, getDefaultFormat } from '../../common/utils/time';
import SuperscriptTime from '../../features/viewers/common/superscript-time/SuperscriptTime';
import { useTranslation } from '../../translation/TranslationProvider';
import Loader from '../common/loader/Loader';
import ScheduleExport from '../common/schedule/ScheduleExport';

import { getBackstageOptions, useBackstageOptions } from './backstage.options';
import { getCardData, getIsPendingStart, getShowProgressBar, isOvertime } from './backstage.utils';
import { BackstageData, useBackstageData } from './useBackstageData';

import './Backstage.scss';

export default function BackstageLoader() {
  const { data, status } = useBackstageData();

  useWindowTitle('Backstage');

  if (status === 'pending') {
    return <Loader />;
  }

  if (status === 'error') {
    return <EmptyPage text='There was an error fetching data, please refresh the page.' />;
  }

  return <Backstage {...data} />;
}

function Backstage({ events, customFields, projectData, isMirrored, settings }: BackstageData) {
  const { getLocalizedString } = useTranslation();
  const { secondarySource, extraInfo } = useBackstageOptions();
  const { eventNext, eventNow, rundown, selectedEventId, time } = useBackstageSocket();
  const [blinkClass, setBlinkClass] = useState(false);
  const { height: screenHeight } = useViewportSize();

  // blink on change
  useEffect(() => {
    setBlinkClass(false);

    const timer = setTimeout(() => {
      setBlinkClass(true);
    }, 10);

    return () => clearTimeout(timer);
  }, [selectedEventId]);

  // gather card data
  const hasEvents = events.length > 0;
  const { showNow, nowMain, nowSecondary, showNext, nextMain, nextSecondary, lucc, mucc, nucc, qucc} = getCardData(
    eventNow,
    eventNext,
    'title',
    secondarySource,
    time.playback,
    'colour',
    'custom',
  );

  // gather timer data
  const isPendingStart = getIsPendingStart(time.playback, time.phase);
  const startedAt = isPendingStart ? formatTime(time.secondaryTimer) : formatTime(time.startedAt);

  const scheduledStart = (() => {
    if (showNow) return undefined;
    if (!hasEvents) return undefined;
    return formatTime(rundown.plannedStart, { format12: 'hh:mm a', format24: 'HH:mm' });
  })();

  const scheduledEnd = (() => {
    if (showNow) return undefined;
    if (!hasEvents) return undefined;
    return formatTime(rundown.plannedEnd, { format12: 'hh:mm a', format24: 'HH:mm' });
  })();

  let displayTimer = millisToString(time.current, { fallback: timerPlaceholderMin });
  displayTimer = removeLeadingZero(displayTimer);

  // gather presentation styles
  const qrSize = Math.max(window.innerWidth / 15, 72);
  const showProgress = getShowProgressBar(time.playback);
  const showSchedule = hasEvents && screenHeight > 420; // in vertical screens we may not have space
  const showPending = scheduledStart && scheduledEnd;

  // gather option data
  const defaultFormat = getDefaultFormat(settings?.timeFormat);
  const backstageOptions = useMemo(
    () => getBackstageOptions(defaultFormat, customFields, projectData),
    [defaultFormat, customFields, projectData],
  );

  return (
    <div className={`backstage ${isMirrored ? 'mirror' : ''}`} data-testid='backstage-view'>
      <ViewParamsEditor target={OntimeView.Backstage} viewOptions={backstageOptions} />
      <div className='project-header'>
        {projectData?.logo && <ViewLogo name={projectData.logo} className='logo' />}
        <div className='title'>{projectData.title}</div>
        <BackstageClock />
      </div>

      {showProgress && <ProgressBar className='progress-container' current={time.current} duration={time.duration} />}

      {!hasEvents && <Empty text={getLocalizedString('common.no_data')} className='empty-container' />}

      <div className='card-container'>
        {showNow && (
          <div className={cx(['event', 'now', blinkClass && 'blink'])} style={{backgroundColor: lucc }}>
            <TitleCard title={nowMain} secondary={nowSecondary} lel={nucc}/>
            <div className='timer-group'>
              <div className='time-entry'>
                <div className={cx(['time-entry__label', isPendingStart && 'time-entry--pending'])} style={{color: nucc}}>
                  {isPendingStart ? getLocalizedString('countdown.waiting') : getLocalizedString('common.started_at')}
                </div>
                <SuperscriptTime time={startedAt} className='time-entry__value' style={{color: nucc}}/>
              </div>
              <div className='timer-gap'/>
              <div className='time-entry' style={{color: nucc}}>
                <div className='time-entry__label' style={{color: nucc}}>{getLocalizedString('common.expected_finish')}</div>
                {isOvertime(time.current) ? (
                  <div className='time-entry__value' style={{color: nucc}}>{getLocalizedString('countdown.overtime')}</div>
                ) : (
                  <SuperscriptTime time={formatTime(time.expectedFinish)} className='time-entry__value' style={{color: nucc}}/>
                )}
              </div>
              <div className='timer-gap' />
              <div className='time-entry' style={{color: nucc}}>
                <div className='time-entry__label' style={{color: nucc}}>{getLocalizedString('common.stage_timer')}</div>
                <div className='time-entry__value' style={{color: nucc}}>{displayTimer}</div>
              </div>
            </div>
          </div>
        )}

        {showPending && (
          <div className='event'>
            <div className='title-card__placeholder' style={{color: nucc}}>{getLocalizedString('countdown.waiting')}</div>
            <div className='timer-group'>
              <div className='time-entry'>
                <div className={cx(['time-entry__label', isPendingStart && 'time-entry--pending'])} style={{color: nucc}}>
                  {getLocalizedString('common.scheduled_start')}
                </div>
                <SuperscriptTime time={scheduledStart} className='time-entry__value' style={{color: nucc}}/>
              </div>
              <div className='timer-gap' />
              <div className='time-entry'>
                <div className='time-entry__label' style={{color: nucc}}>{getLocalizedString('common.scheduled_end')}</div>
                <SuperscriptTime time={scheduledEnd} className='time-entry__value' style={{color: nucc}}/>
              </div>
            </div>
          </div>
        )}

        {showNext && hasEvents && (
          <TitleCard className='event' label='next' title={nextMain} secondary={nextSecondary} lawl={mucc} lawl={qucc}/>
        )}
      </div>

      {showSchedule && <ScheduleExport selectedId={selectedEventId} />}
      
    </div>
  );
}

function BackstageClock() {
  const { getLocalizedString } = useTranslation();
  const { clock } = useClock();

  // gather timer data
  const formattedClock = formatTime(clock);

  return (
    <div className='clock-container'>
      <div className='label'>{getLocalizedString('common.time_now')}</div>
      <SuperscriptTime time={formattedClock} className='time' />
    </div>
  );
}
