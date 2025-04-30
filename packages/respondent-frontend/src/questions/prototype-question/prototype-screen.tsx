import { useRef } from 'react';

import type { PrototypeArea, PrototypeScreen as PrototypeScreenType } from 'shared';

import styles from './prototype-screen.module.css';

export const PrototypeScreen = ({
  screen,
  onClick,
}: {
  screen: PrototypeScreenType;
  onClick: (click: { x: number; y: number }, area: PrototypeArea | null) => void;
}) => {
  const imageRef = useRef<HTMLImageElement | null>(null);

  const calculateClickRelativePosition = (event: React.MouseEvent) => {
    const image = imageRef.current;
    if (!image) return null;
    const imageRect = image.getBoundingClientRect();

    const x = ((event.clientX - imageRect.left) / imageRect.width) * 100;
    const y = ((event.clientY - imageRect.top) / imageRect.height) * 100;

    return { x, y };
  };

  const handleImageClick = (event: React.MouseEvent, area: PrototypeArea | null) => {
    event.stopPropagation();
    const clickPosition = calculateClickRelativePosition(event);

    if (clickPosition) {
      onClick(clickPosition, area);
    }
  };

  return (
    <div className={styles.screen}>
      <div className={styles.imageContainer}>
        <img
          ref={imageRef}
          className={styles.image}
          src={screen.data.imageSrc}
          draggable={false}
          onClick={(event) => handleImageClick(event, null)}
        />

        {screen.data.areas.map((area) => (
          <div
            key={area.id}
            className={styles.clickableArea}
            style={{
              left: `${area.rect.left}%`,
              top: `${area.rect.top}%`,
              width: `${area.rect.width}%`,
              height: `${area.rect.height}%`,
            }}
            onClick={(event) => handleImageClick(event, area)}
          />
        ))}
      </div>
    </div>
  );
};
