import { ForwardedRef, forwardRef } from 'react';

import { useTranslation } from '../../../translation/TranslationProvider';
import { cx } from '../../utils/styleUtils';

import './TitleCard.scss';

interface TitleCardProps {
  title?: string;
  label?: 'now' | 'next';
  secondary?: string;
  color?: string;
  bgColor?: string;
  className?: string;
}

const TitleCard = forwardRef((props: TitleCardProps, ref: ForwardedRef<HTMLDivElement>) => {
  const { label, title, secondary, color, bgColor, className = '', } = props;
  const { getLocalizedString } = useTranslation();

  const accent = label === 'now';
  console.log("It updated successfully again.")
  console.log(props)

  return (
    <div className={cx(['title-card', className])} style={{backgroundColor: bgColor}} ref={ref}>
      <span className='title-card__title' style={{color: color}}>{title}</span>
      <span className={cx(['title-card__label', accent && 'title-card__label--accent'])} style={{color: color}}>
        {label && getLocalizedString(`common.${label}`)}
              </span>
      <div className='title-card__secondary' style={{color: color}}>{secondary}</div>
    </div>
  );
});

TitleCard.displayName = 'TitleCard';
export default TitleCard;
