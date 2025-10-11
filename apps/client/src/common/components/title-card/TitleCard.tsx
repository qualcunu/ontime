import { ForwardedRef, forwardRef } from 'react';

import { useTranslation } from '../../../translation/TranslationProvider';
import { cx } from '../../utils/styleUtils';

import './TitleCard.scss';

interface TitleCardProps {
  title?: string;
  label?: 'now' | 'next';
  secondary?: string;
  className?: string;
  lel?: string;
}

const TitleCard = forwardRef((props: TitleCardProps, ref: ForwardedRef<HTMLDivElement>) => {
  const { label, title, secondary, lel, className = '' } = props;
  const { getLocalizedString } = useTranslation();

  const accent = label === 'now';

  return (
    <div className={cx(['title-card', className])} style={{backgroundColor: lel}} ref={ref}>
      <span className='title-card__title' style={{color: secondary}}>{title}</span>
      <span className={cx(['title-card__label', accent && 'title-card__label--accent'])}>
        {label && getLocalizedString(`common.${label}`)}
      </span>
      <div className='title-card__secondary' style={{color: secondary }}>{secondary}</div>
    </div>
  );
});

TitleCard.displayName = 'TitleCard';
export default TitleCard;
