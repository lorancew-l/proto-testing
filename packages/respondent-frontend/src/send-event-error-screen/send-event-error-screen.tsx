import NetworkErrorIcon from '../assets/network-error-icon.svg?react';
import { useResearchMachineContext } from '../research-machine';
import { useResearchStatePredicate } from '../research-machine/research-machine';
import { Button, CenteredContentWrapper } from '../ui';

import styles from './send-event-error-screen.module.css';

export const SendEventErrorScreen = () => {
  const { send } = useResearchMachineContext();
  const retrying = useResearchStatePredicate({ questionScreen: { submitting: 'processing' } });

  return (
    <CenteredContentWrapper>
      <div className={styles.content}>
        <NetworkErrorIcon className={styles.icon} />

        <span>Ошибка при отправке событий!</span>

        <Button loading={retrying} onClick={() => send({ type: 'retryEventSending' })}>
          Повторить отправку
        </Button>
      </div>
    </CenteredContentWrapper>
  );
};
