import { useEffect, useMemo, useState } from 'react';
import QRCode from 'react-qr-code';
import { useViewportSize } from '@mantine/hooks';
import { OntimeView, ProjectData, TimerType } from 'ontime-types';
import { millisToString, removeLeadingZero } from 'ontime-utils';

import { FitText } from '../../common/components/fit-text/FitText';
import MultiPartProgressBar from '../../common/components/multi-part-progress-bar/MultiPartProgressBar';

import { serverURL } from '../../externals';

import ProgressBar from '../../common/components/progress-bar/ProgressBar';
import Empty from '../../common/components/state/Empty';
import EmptyPage from '../../common/components/state/EmptyPage';
import TitleCard from '../../common/components/title-card/TitleCard';
import ViewLogo from '../../common/components/view-logo/ViewLogo';
import ViewParamsEditor from '../../common/components/view-params-editor/ViewParamsEditor';
import { useBackstageSocket, useClock } from '../../common/hooks/useSocket';
import { useTimerSocket, useAuxTimerControl, useAuxTimersTime } from '../../common/hooks/useSocket';
import { useWindowTitle } from '../../common/hooks/useWindowTitle';
import { cx, timerPlaceholderMin } from '../../common/utils/styleUtils';
import { formatTime, getDefaultFormat } from '../../common/utils/time';
import SuperscriptTime from '../../features/viewers/common/superscript-time/SuperscriptTime';
import { getFormattedTimer, getTimerByType } from '../../features/viewers/common/viewUtils';
import { useTranslation } from '../../translation/TranslationProvider';
import Loader from '../common/loader/Loader';
import ScheduleExport from '../common/schedule/ScheduleExport';

import { getBackstageOptions, useBackstageOptions } from './backstage.options';
import { getCardData, getIsPendingStart, getShowProgressBar, isOvertime } from './backstage.utils';
import { BackstageData, useBackstageData } from './useBackstageData';

import { getTimerOptions, useTimerOptions } from './timer.options';
import {
    getEstimatedFontSize,
    getIsPlaying,
    getSecondaryDisplay,
    getShowClock,
    getShowMessage,
    getShowModifiers,
    getTotalTime,
} from './timer.utils';
import { TimerData, useTimerData } from './useTimerData';

import style from '../../features/sharing/GenerateLinkForm.module.scss';

import './Backstage.scss';
//import './Timer.scss';
import './StudioTimers.scss';

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


function Backstage({ events, customFields, projectData, isMirrored, settings, viewSettings }: BackstageData) {
    const { getLocalizedString } = useTranslation();
    const { secondarySource, extraInfo } = useBackstageOptions();
    const { eventNext, eventNow, rundown, selectedEventId, time } = useBackstageSocket();
    const [blinkClass, setBlinkClass] = useState(false);
    const { height: screenHeight } = useViewportSize();

    const { message, clock, timerTypeNow, countToEndNow, auxTimer } = useTimerSocket();
    const {
        hideClock,
        hideCards,
        hideProgress,
        hideMessage,
        hideSecondary,
        hideTimerSeconds,
        removeLeadingZeros,
        mainSource,
        timerType,
        freezeOvertime,
        freezeMessage,
        hidePhase,
    } = useTimerOptions();
    const localisedMinutes = getLocalizedString('common.minutes');
    // gather modifiers
    const viewTimerType = timerType ?? timerTypeNow;
    const showOverlay = getShowMessage(message.timer);
    const { showFinished } = getShowModifiers(
        timerTypeNow,
        countToEndNow,
        time.phase,
        freezeOvertime,
        freezeMessage,
        hidePhase,
    );
    const isPlaying = getIsPlaying(time.playback);
    const showClock = !hideClock && getShowClock(viewTimerType);
    const showProgressBar = !hideProgress && getShowProgressBar(viewTimerType);
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
    const { showNow, nowMain, nowSecondary, showNext, nextMain, nextSecondary, eventNowBgColor, eventNextBgColor, eventNowTextColor, eventNextTextColor } = getCardData(
        eventNow,
        eventNext,
        'title',
        mainSource,
        secondarySource,
        time.playback,
        time.phase,
    );
    // gather timer data
    const url = serverURL + "/preset/e?n=1";
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
    // gather timer's timer data
    const totalTime = getTotalTime(time.duration, time.addedTime);
    const formattedClock = formatTime(clock);
    const stageTimer = getTimerByType(freezeOvertime, timerTypeNow, countToEndNow, clock, time, timerType);
    const display = getFormattedTimer(stageTimer, viewTimerType, localisedMinutes, {
        removeSeconds: hideTimerSeconds,
        removeLeadingZero: removeLeadingZeros,
    });
    const currentAux = (() => {
        if (message.timer.secondarySource === 'aux1') {
            return auxTimer.aux1;
        }
        if (message.timer.secondarySource === 'aux2') {
            return auxTimer.aux2;
        }
        if (message.timer.secondarySource === 'aux3') {
            return auxTimer.aux3;
        }
        return null;
    })();
    const secondaryContent = getSecondaryDisplay(
        message,
        currentAux,
        localisedMinutes,
        hideTimerSeconds,
        removeLeadingZeros,
        hideSecondary,
    );
    
    const uga1 = getFormattedTimer(auxTimer.aux1, TimerType.CountDown, localisedMinutes, {});
    const uga2 = getFormattedTimer(auxTimer.aux2, TimerType.CountDown, localisedMinutes, {});
    const uga3 = getFormattedTimer(auxTimer.aux3, TimerType.CountDown, localisedMinutes, {});

    const { Aux1_state } = useAuxTimerControl(1);
    const { Aux2_state } = useAuxTimerControl(2);
    const { Aux3_state } = useAuxTimerControl(3);
    console.log(Aux1_state, " ", Aux2_state, " ", Aux3_state);
    
    // gather presentation styles
    const qrSize = Math.max(window.innerWidth / 15, 72);
    const showProgress = getShowProgressBar(time.playback);
    const showSchedule = hasEvents && screenHeight > 420; // in vertical screens we may not have space
    const showPending = scheduledStart && scheduledEnd;
    const { externalFontSize } = getEstimatedFontSize(display, secondaryContent);
    // gather option data
    const defaultFormat = getDefaultFormat(settings?.timeFormat);
    const backstageOptions = useMemo(() => getBackstageOptions(defaultFormat, customFields, projectData), [defaultFormat, customFields, projectData]);
    const timerOptions = useMemo(() => getTimerOptions(defaultFormat, customFields), [customFields, defaultFormat]);
    return (
        <div className={`backstage ${isMirrored ? 'mirror' : ''}`} data-testid='backstage-view'>
            <div className={cx(['blackout', message.timer.blackout && 'blackout--active'])} />
            <ViewParamsEditor target={OntimeView.Backstage} viewOptions={backstageOptions} />
            {!hideMessage && (
                <div className={cx(['message-overlay', showOverlay && 'message-overlay--active'])}>
                    <FitText mode='multi' min={32} max={256} className={cx(['message', message.timer.blink && 'blink'])}>
                        {message.timer.text}
                    </FitText>
                </div>
            )}
            <div className='project-header'>
                {projectData?.logo && <ViewLogo name={projectData.logo} className='logo' />}
                <div className='title'>{projectData.title}</div>
                <QRCode size={100} value={url} className={style.qrCode} />
                <BackstageClock />
            </div>
            {showProgressBar && (
                <MultiPartProgressBar
                    className={cx(['progress-container', !isPlaying && 'progress-container--paused'])}
                    now={time.current}
                    complete={totalTime}
                    normalColor={viewSettings.normalColor}
                    warning={eventNow?.timeWarning}
                    warningColor={viewSettings.warningColor}
                    danger={eventNow?.timeDanger}
                    dangerColor={viewSettings.dangerColor}
                    hideOvertime={!showFinished} />
            )}

            {!hasEvents && <Empty text={getLocalizedString('common.no_data')} className='empty-container' />}
            <div className='card-container'>
                {showNow && (
                    <div className={cx(['timer-container', message.timer.blink && !showOverlay && 'blink'])} style={{flex: 'unset'}}>
                        <div className={cx(['event', 'now', blinkClass && 'blink'])} style={{ backgroundColor: eventNowBgColor }}>
                            <TitleCard title={nowMain} secondary={nowSecondary} bgColor={eventNowBgColor} color={eventNowTextColor} />
                            <div className='timer-group'>
                                <div className='time-entry'>
                                    <div className={cx(['time-entry__label', isPendingStart && 'time-entry--pending'])} style={{ color: eventNowTextColor }}>
                                        {isPendingStart ? getLocalizedString('countdown.waiting') : getLocalizedString('common.started_at')}
                                    </div>
                                    <SuperscriptTime time={startedAt} className='time-entry__value' style={{ color: eventNowTextColor }} />
                                </div>
                                <div className='timer-gap' />
                                <div className='time-entry' style={{ color: eventNowTextColor }}>
                                    <div className='time-entry__label' style={{ color: eventNowTextColor }}>{getLocalizedString('common.expected_finish')}</div>
                                    {isOvertime(time.current) ? (
                                        <div className='time-entry__value' style={{ color: eventNowTextColor }}>{getLocalizedString('countdown.overtime')}</div>
                                    ) : (
                                        <SuperscriptTime time={formatTime(time.expectedFinish)} className='time-entry__value' style={{ color: eventNowTextColor }} />
                                    )}
                                </div>
                                <div className='timer-gap' />
                                <div className='time-entry' style={{ color: eventNowTextColor }}>
                                    <div className='time-entry__label' style={{ color: eventNowTextColor }}>{getLocalizedString('common.stage_timer')}</div>
                                    <div className='time-entry__value' style={{ color: eventNowTextColor }}>{displayTimer}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {showPending && (
                    <div className='event'>
                        <div className='title-card__placeholder' style={{ color: eventNowTextColor }}>{getLocalizedString('countdown.waiting')}</div>
                        <div className='timer-group'>
                            <div className='time-entry'>
                                <div className={cx(['time-entry__label', isPendingStart && 'time-entry--pending'])} style={{ color: eventNowTextColor }}>
                                    {getLocalizedString('common.scheduled_start')}
                                </div>
                                <SuperscriptTime time={scheduledStart} className='time-entry__value' style={{ color: eventNowTextColor }} />
                            </div>
                            <div className='timer-gap' />
                            <div className='time-entry'>
                                <div className='time-entry__label' style={{ color: eventNowTextColor }}>{getLocalizedString('common.scheduled_end')}</div>
                                <SuperscriptTime time={scheduledEnd} className='time-entry__value' style={{ color: eventNowTextColor }} />
                            </div>
                        </div>
                    </div>
                )}
                {showNext && hasEvents && (
                    <TitleCard className='event' label='next' title={nextMain} secondary={nextSecondary} color={eventNextTextColor} bgColor={eventNextBgColor} />
                )}
                <div className={cx(['secondary', !secondaryContent && 'secondary--hidden'])} style={{ fontSize: `${externalFontSize}vw` }}>
                    {secondaryContent}
                </div>
                <div className={cx(['secondary', !secondaryContent && 'secondary--hidden'])} style={{ fontSize: `5vw` }}>
                    Aux Timer 1:  {uga1}
                </div>
                <div className={cx(['secondary', !secondaryContent && 'secondary--hidden'])} style={{ fontSize: `5vw` }}>
                    Aux Timer 2:  {uga2}
                </div>
                <div className={cx(['secondary', !secondaryContent && 'secondary--hidden'])} style={{ fontSize: `5vw` }}>
                    Aux Timer 3:  {uga3}
                </div>
            </div>

            {showSchedule && <ScheduleExport selectedId={selectedEventId} />}
        </div>
    );
}

function StudioTimersAux() {
  const auxTimer = useAuxTimersTime();

  return (
    <div className='card' id='card-aux'>
      <div className='card__row'>
        <div>
          <div className='label'>Aux 1</div>
          <div className='extra'>{millisToString(auxTimer.aux1)}</div>
        </div>

        <div>
          <div className='label center'>Aux 2</div>
          <div className='extra center'>{millisToString(auxTimer.aux2)}</div>
        </div>

        <div>
          <div className='label right'>Aux 3</div>
          <div className='extra right'>{millisToString(auxTimer.aux3)}</div>
        </div>
      </div>
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
