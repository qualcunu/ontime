import { use, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { CustomFields, OntimeEvent, ProjectData } from 'ontime-types';

import { getTimeOption } from '../../common/components/view-params-editor/common.options';
import { OptionTitle } from '../../common/components/view-params-editor/constants';
import { ViewOption } from '../../common/components/view-params-editor/viewParams.types';
import {
  makeOptionsFromCustomFields,
  makeProjectDataOptions,
} from '../../common/components/view-params-editor/viewParams.utils';
import { PresetContext } from '../../common/context/PresetContext';
import { getScheduleOptions } from '../common/schedule/schedule.options';

export const getBackstageOptions = (
  timeFormat: string,
  customFields: CustomFields,
  projectData: ProjectData,
): ViewOption[] => {
  const customFieldOptions = makeOptionsFromCustomFields(customFields, [{ value: 'none', label: 'None' }]);
  const secondaryOptions = makeOptionsFromCustomFields(customFields, [
    { value: 'none', label: 'None' },
    { value: 'note', label: 'Note' },
  ]);
  const projectDataOptions = makeProjectDataOptions(projectData, [{ value: 'none', label: 'None' }]);

  return [
    { title: OptionTitle.ClockOptions, collapsible: true, options: [getTimeOption(timeFormat)] },
    {
      title: OptionTitle.DataSources,
      collapsible: true,
      options: [
        {
          id: 'secondary-src',
          title: 'Event secondary text',
          description: 'Select the data source for auxiliary text shown in now and next cards',
          type: 'option',
          values: secondaryOptions,
          defaultValue: 'none',
        },
      ],
    },
    getScheduleOptions(customFieldOptions),
    {
      title: OptionTitle.ElementVisibility,
      collapsible: true,
      options: [
        {
          id: 'extra-info',
          title: 'Text color alteration',
          description: 'Use a custom field to alter text color per event.',
          type: 'option',
          values: customFieldOptions,
          defaultValue: 'none',
        },
      ],
    },
  ];
};

type BackstageOptions = {
  secondarySource: keyof OntimeEvent | null;
  extraInfo: keyof OntimeEvent | null;
};

/**
 * Utility extract the view options from URL Params
 * the names and fallback are manually matched with timerOptions
 */
function getOptionsFromParams(searchParams: URLSearchParams, defaultValues?: URLSearchParams): BackstageOptions {
  // Helper to get value from either source, prioritizing defaultValues
  const getValue = (key: string) => defaultValues?.get(key) ?? searchParams.get(key);

  return {
    secondarySource: getValue('secondary-src') as keyof OntimeEvent | null,
    extraInfo: getValue('extra-info') as keyof OntimeEvent | null,
  };
}

/**
 * Hook exposes the backstage view options
 */
export function useBackstageOptions(): BackstageOptions {
  const [searchParams] = useSearchParams();
  const maybePreset = use(PresetContext);

  const options = useMemo(() => {
    const defaultValues = maybePreset ? new URLSearchParams(maybePreset.search) : undefined;
    return getOptionsFromParams(searchParams, defaultValues);
  }, [maybePreset, searchParams]);

  return options;
}
