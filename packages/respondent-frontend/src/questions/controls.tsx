import { useResearchMachineContext } from '../research-machine';
import { useIsSubmittingAnswer } from '../research-machine/research-machine';
import { Button } from '../ui';

import styles from './controls.module.css';

export const Controls = ({ requiresAnswer }: { requiresAnswer: boolean }) => {
  const { send } = useResearchMachineContext();
  const submitting = useIsSubmittingAnswer();

  return (
    <div className={styles.container}>
      {!requiresAnswer && (
        <Button variant="plain" loading={submitting} onClick={() => send({ type: 'skip' })}>
          Пропустить
        </Button>
      )}

      <Button loading={submitting} onClick={() => send({ type: 'answer' })}>
        Ответить
      </Button>
    </div>
  );
};
