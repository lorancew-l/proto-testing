import { useResearchMachineContext } from '../research-machine';
import { useIsSubmittingAnswer } from '../research-machine/research-machine';
import { Button } from '../ui';

import styles from './controls.module.css';

export const Controls = () => {
  const { send } = useResearchMachineContext();
  const submitting = useIsSubmittingAnswer();

  return (
    <div className={styles.container}>
      <Button loading={submitting} onClick={() => send({ type: 'answer' })}>
        Ответить
      </Button>
    </div>
  );
};
