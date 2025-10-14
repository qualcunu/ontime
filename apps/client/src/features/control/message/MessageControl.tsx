import { IoEye, IoEyeOffOutline } from 'react-icons/io5';

import IconButton from '../../../common/components/buttons/IconButton';
import {
  setMessage,
  useExternalMessageInput as useSecondaryMessageInput,
  useTimerMessageInput,
  useExternalAux1Label as useAux1Label,
  useExternalAux2Label as useAux2Label,
  useExternalAux3Label as useAux3Label,
} from '../../../common/hooks/useSocket';

import InputRow from './InputRow';
import TimerControlsPreview from './TimerViewControl';

export default function MessageControl() {
  return (
    <>
      <TimerControlsPreview />
      <TimerMessageInput />
      <SecondaryInput />
      <Aux1_Name />
      <Aux2_Name />
      <Aux3_Name />
    </>
  );
}

function TimerMessageInput() {
  const { text, visible } = useTimerMessageInput();

  return (
    <InputRow
      label='Timer Message'
      placeholder='Message shown fullscreen in stage timer'
      text={text}
      visible={visible}
      changeHandler={(newValue) => setMessage.timerText(newValue)}
    >
      <IconButton
        aria-label='Toggle timer message visibility'
        onClick={() => setMessage.timerVisible(!visible)}
        variant={visible ? 'primary' : 'subtle'}
      >
        {visible ? <IoEye /> : <IoEyeOffOutline />}
      </IconButton>
    </InputRow>
  );
}

function SecondaryInput() {
  const { text, visible } = useSecondaryMessageInput();

  const toggleSecondary = () => {
    if (visible) {
      setMessage.timerSecondarySource(null);
    } else {
      setMessage.timerSecondarySource('secondary');
    }
  };

  return (
    <InputRow
      label='Secondary Message'
      placeholder='Message shown as secondary text in stage timer'
      text={text}
      visible={visible}
      changeHandler={(newValue) => setMessage.secondaryMessage(newValue)}
    >
      <IconButton
        aria-label='Toggle secondary message visibility'
        onClick={toggleSecondary}
        variant={visible ? 'primary' : 'subtle'}
      >
        {visible ? <IoEye /> : <IoEyeOffOutline />}
      </IconButton>
    </InputRow>
  );
}

function Aux1_Name() {
  const { text } = useAux1Label();

  return (
    <InputRow
      label='Aux 1 Label'
      placeholder='Label for Aux 1'
      text={text}
      changeHandler={(newValue) => setMessage.aux1Label(newValue)}
    >
    </InputRow>
  );
}

function Aux2_Name() {
  const { text } = useAux2Label();

  return (
    <InputRow
      label='Aux 2 Label'
      placeholder='Label for Aux 2'
      text={text}
      changeHandler={(newValue) => setMessage.aux2Label(newValue)}
    >
    </InputRow>
  );
}

function Aux3_Name() {
  const { text } = useAux3Label();

  return (
    <InputRow
      label='Aux 3 Label'
      placeholder='Label for Aux 3'
      text={text}
      changeHandler={(newValue) => setMessage.aux3Label(newValue)}
    >
    </InputRow>
  );
}

