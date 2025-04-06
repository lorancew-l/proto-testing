import { useResearchMachineContext } from '../research-machine';

import styles from './controls.module.css';

export const Controls = () => {
  const { send } = useResearchMachineContext();

  return (
    <div className={styles.container}>
      <button type="button" className={styles.answerButton} onClick={() => send({ type: 'answer' })}>
        Ответить
      </button>
    </div>
  );
};
