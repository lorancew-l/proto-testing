import { memo } from 'react';

import { capitalize } from 'lodash';

import { DesktopWindows, PhoneIphone, TabletMac } from '@mui/icons-material';
import { Divider, Typography, alpha } from '@mui/material';

import { format, parse } from 'date-fns';
import { ru } from 'date-fns/locale';
import { makeStyles } from 'tss-react/mui';

import { Session } from '../../../api';
import { Sidebar } from '../sidebar';

const useStyles = makeStyles()((theme) => ({
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    cursor: 'pointer',
    marginBottom: theme.spacing(2),
  },
  sessionCount: {
    borderRadius: '1rem',
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.common.white,
    padding: theme.spacing(0, 0.5),
    textAlign: 'center',
  },
  sessionList: {
    padding: theme.spacing(0.25),
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
    overflowY: 'auto',
    maxHeight: 'calc(100vh - 185px)',
    marginLeft: theme.spacing(-0.25),
  },
  sessionItem: {
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'nowrap',
    gap: theme.spacing(1),
    borderRadius: theme.shape.borderRadius * 2,
    backgroundColor: theme.palette.common.white,
    cursor: 'pointer',
    padding: theme.spacing(1),
    '&:hover': {
      outline: `2px solid ${theme.palette.primary.light}`,
      zIndex: 100,
    },
  },
  selectedSession: {
    backgroundColor: alpha(theme.palette.primary.light, 0.2),
  },
  deviceInfo: {
    display: 'flex',
    alignItems: 'center',
  },
  divider: {
    height: '1rem',
    borderRightWidth: '2px',
    margin: theme.spacing(0, 0.5),
  },
  deviceIcon: {
    width: '1rem',
    height: '1rem',
  },
}));

export const SessionSidebar = ({
  sessions,
  selectedSessionId,
  onSelectSession,
  isLoading,
}: {
  sessions: Session[];
  isLoading: boolean;
  selectedSessionId: string | null;
  onSelectSession: (sessionId: string | null) => void;
}) => {
  const { classes } = useStyles();

  return (
    <Sidebar isLoading={isLoading}>
      <div className={classes.header} role="button" onClick={() => onSelectSession(null)}>
        <Typography variant="h6">Прохождения</Typography>

        <Typography className={classes.sessionCount} variant="body2">
          {sessions.length}
        </Typography>
      </div>

      <ol className={classes.sessionList}>
        {sessions.map((session) => (
          <SessionItem
            key={session.session_id}
            session={session}
            selected={session.session_id === selectedSessionId}
            onClick={onSelectSession}
          />
        ))}
      </ol>
    </Sidebar>
  );
};

const SessionItem = memo(
  ({ session, selected, onClick }: { session: Session; selected: boolean; onClick: (sessionId: string) => void }) => {
    const { classes, cx } = useStyles();

    const DeviceIcon = getDeviceIcon(session.device);

    return (
      <li
        className={cx(classes.sessionItem, { [classes.selectedSession]: selected })}
        onClick={() => onClick(session.session_id)}
      >
        <Typography variant="body1" fontWeight="bold">
          {formatUtcToLocal(session.ts)}
        </Typography>

        <div className={classes.deviceInfo}>
          {DeviceIcon ? <DeviceIcon className={classes.deviceIcon} color="action" /> : capitalize(session.device)}

          <Divider className={classes.divider} orientation="vertical" />

          <Typography variant="body2" color="action.active" component="span">
            {formatOSName(session.os)}
          </Typography>

          <Divider className={classes.divider} orientation="vertical" />

          <Typography variant="body2" color="action.active" component="span">
            {session.browser}
          </Typography>
        </div>
      </li>
    );
  },
);

const formatOSName = (name: string): string => {
  const map: Record<string, string> = {
    ios: 'iOS',
    android: 'Android',
    windows: 'Windows',
    macos: 'macOS',
    linux: 'Linux',
  };

  return map[name.toLowerCase()] || capitalize(name);
};

const getDeviceIcon = (device: string) => {
  switch (device.toLowerCase()) {
    case 'desktop':
      return DesktopWindows;
    case 'mobile':
      return PhoneIphone;
    case 'tablet':
      return TabletMac;
    default:
      return null;
  }
};

function formatUtcToLocal(utcString: string) {
  const parsedUtc = parse(utcString, 'yyyy-MM-dd HH:mm:ss', new Date());
  const timeZoneOffset = new Date().getTimezoneOffset();
  parsedUtc.setMinutes(parsedUtc.getMinutes() - timeZoneOffset);
  return format(parsedUtc, 'd MMMM, HH:mm', { locale: ru });
}
