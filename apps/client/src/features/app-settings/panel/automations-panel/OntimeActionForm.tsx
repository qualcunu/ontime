import { PropsWithChildren, useState } from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { AutomationDTO, OntimeAction, OntimeActionKey, SecondarySource, SimpleDirection } from 'ontime-types';

import Input from '../../../../common/components/input/input/Input';
import Select from '../../../../common/components/select/Select';
import * as Panel from '../../panel-utils/PanelUtils';

import style from './AutomationForm.module.scss';

interface OntimeActionFormProps {
  index: number;
  register: UseFormRegister<AutomationDTO>;
  rowErrors?: {
    action?: { message?: string };
    time?: { message?: string };
    text?: { message?: string };
    visible?: { message?: string };
    secondarySource?: { message?: string };
    aux1label?: { message?: string };
    aux2label?: { message?: string };
    aux3label?: { message?: string };
    flip1?: { message?: string };
    flip2?: { message?: string };
    flip3?: { message?: string };
  };
  value: OntimeAction['action'];
  watch: UseFormWatch<AutomationDTO>;
  setValue: UseFormSetValue<AutomationDTO>;
}

export default function OntimeActionForm({
  index,
  register,
  setValue,
  rowErrors,
  value,
  children,
  watch,
}: PropsWithChildren<OntimeActionFormProps>) {
  const [selectedAction, setSelectedAction] = useState<string>(value);

  const handleSetAction = (value: OntimeActionKey) => {
    setValue(`outputs.${index}.action`, value, { shouldDirty: true });
    setSelectedAction(value);
  };

  return (
    <div className={style.actionSection}>
      <label>
        Action
        <Select
          onValueChange={(value) => {
            handleSetAction(value as OntimeActionKey);
          }}
          value={watch(`outputs.${index}.action`)}
          options={[
            { value: 'aux1-pause', label: 'Aux 1: pause' },
            { value: 'aux2-pause', label: 'Aux 2: pause' },
            { value: 'aux3-pause', label: 'Aux 3: pause' },

            { value: 'aux1-start', label: 'Aux 1: start' },
            { value: 'aux2-start', label: 'Aux 2: start' },
            { value: 'aux3-start', label: 'Aux 3: start' },

            { value: 'aux1-stop', label: 'Aux 1: stop' },
            { value: 'aux2-stop', label: 'Aux 2: stop' },
            { value: 'aux3-stop', label: 'Aux 3: stop' },

            { value: 'aux1-set', label: 'Aux 1: set' },
            { value: 'aux2-set', label: 'Aux 2: set' },
            { value: 'aux3-set', label: 'Aux 3: set' },

            { value: 'aux1-flip', label: 'Aux 1: change direction' },
            { value: 'aux2-flip', label: 'Aux 2: change direction' },
            { value: 'aux3-flip', label: 'Aux 3: change direction' },

            { value: 'message-set', label: 'Primary Message: set' },
            { value: 'message-secondary', label: 'Secondary Message: source' },
            { value: 'aux1-rename', label: 'Aux 1 Label' },
            { value: 'aux2-rename', label: 'Aux 2 Label' },
            { value: 'aux3-rename', label: 'Aux 3 Label' },
          ]}
        />
        <Panel.Error>{rowErrors?.action?.message}</Panel.Error>
      </label>

      {selectedAction.startsWith('aux') && selectedAction.endsWith('set') && (
        <label>
          New time
          <Input
            {...register(`outputs.${index}.time`, {
              required: { value: true, message: 'Required field' },
            })}
            fluid
            placeholder='eg: 10m5s'
          />
          <Panel.Error>{rowErrors?.time?.message}</Panel.Error>
        </label>
      )}

        {selectedAction === 'aux1-flip' && (
        <>
          <label>
            Timer direction
            <Select
              onValueChange={(value) => {
                setValue(`outputs.${index}.flip1`, value as SimpleDirection, { shouldDirty: true });
              }}
              value={watch(`outputs.${index}.flip1`)}
              options={[
                { value: 'Count-Up', label: 'Count up' },
                { value: 'Count-Down', label: 'Count down' },
              ]}
            />
            <Panel.Error>{rowErrors?.flip1?.message}</Panel.Error>
          </label>
        </>
      )}

      {selectedAction === 'aux2-flip' && (
        <>
          <label>
            Timer direction
            <Select
              onValueChange={(value) => {
                setValue(`outputs.${index}.flip2', value as SimpleDirection, { shouldDirty: true });
              }}
              value={watch(`outputs.${index}.flip2`)}
              options={[
                { value: 'Count-Up', label: 'Count up' },
                { value: 'Count-Down', label: 'Count down' },
              ]}
            />
            <Panel.Error>{rowErrors?.flip2?.message}</Panel.Error>
          </label>
        </>
      )}

      {selectedAction === 'aux3-flip' && (
        <>
          <label>
            Timer direction
            <Select
              onValueChange={(value) => {
                setValue(`outputs.${index}.flip3`, value as SimpleDirection, { shouldDirty: true });
              }}
              value={watch(`outputs.${index}.flip3`)}
              options={[
                { value: 'Count-Up', label: 'Count up' },
                { value: 'Count-Down', label: 'Count down' },
              ]}
            />
            <Panel.Error>{rowErrors?.flip3?.message}</Panel.Error>
          </label>
        </>
      )}

      {selectedAction === 'message-set' && (
        <>
          <label>
            Text (leave empty for no change)
            <Input {...register(`outputs.${index}.text`)} fluid placeholder='eg: Timer is finished' />
            <Panel.Error>{rowErrors?.text?.message}</Panel.Error>
          </label>
          <label>
            Visibility
            <Select
              onValueChange={(value) => {
                // we need to translate the undefined value to 'untouched'
                const translatedValue = value === 'untouched' ? undefined : (value as boolean | undefined);
                setValue(`outputs.${index}.visible`, translatedValue, { shouldDirty: true });
              }}
              value={watch(`outputs.${index}.visible`) === undefined ? 'untouched' : watch(`outputs.${index}.visible`)}
              options={[
                { value: 'untouched', label: 'Untouched' },
                { value: true, label: 'Show' },
                { value: false, label: 'Hide' },
              ]}
            />
            <Panel.Error>{rowErrors?.visible?.message}</Panel.Error>
          </label>
        </>
      )}

      {selectedAction === 'message-secondary' && (
        <label>
          Timer secondary source
          <Select
            onValueChange={(value) => {
              setValue(`outputs.${index}.secondarySource`, value as SecondarySource, { shouldDirty: true });
            }}
            value={watch(`outputs.${index}.secondarySource`)}
            options={[
              { value: null, label: 'Select secondary source', disabled: true },
              { value: 'aux1', label: 'Auxiliary timer 1' },
              { value: 'aux2', label: 'Auxiliary timer 2' },
              { value: 'aux3', label: 'Auxiliary timer 3' },
              { value: 'external', label: 'External' },
              { value: 'null', label: 'None' },
            ]}
          />
          <Panel.Error>{rowErrors?.secondarySource?.message}</Panel.Error>
        </label>
      )}

      {selectedAction === 'aux1-rename' && (
        <>
          <label>
            Text (leave empty for no change)
            <Input {...register(`outputs.${index}.aux1label`)} fluid placeholder='eg: Aux 1 Label' />
            <Panel.Error>{rowErrors?.aux1label?.message}</Panel.Error>
          </label>
        </>
      )}

      {selectedAction === 'aux2-rename' && (
        <>
          <label>
            Text (leave empty for no change)
            <Input {...register(`outputs.${index}.aux2label`)} fluid placeholder='eg: Aux 2 Label' />
            <Panel.Error>{rowErrors?.aux2label?.message}</Panel.Error>
          </label>
        </>
      )}

      {selectedAction === 'aux3-rename' && (
        <>
          <label>
            Text (leave empty for no change)
            <Input {...register(`outputs.${index}.aux3label`)} fluid placeholder='eg: Aux 3 Label' />
            <Panel.Error>{rowErrors?.aux3label?.message}</Panel.Error>
          </label>
        </>
      )}

      <div className={style.test}>{children}</div>
    </div>
  );
}
