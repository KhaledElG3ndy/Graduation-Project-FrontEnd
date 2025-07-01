import { useEffect, useRef, useState } from 'react';

export default function useJitsiExternal({
  roomName,
  userInfo,
  domain = import.meta.env.VITE_JITSI_DOMAIN,
  configOverwrite = {},
  interfaceConfigOverwrite = {},
}) {
  const iframeRef = useRef(null);
  const [api, setApi] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!roomName) return;
    const load = () => {
      try {
        const _api = new window.JitsiMeetExternalAPI(domain, {
          roomName,
          parentNode: iframeRef.current,
          userInfo,
          configOverwrite,
          interfaceConfigOverwrite,
        });
        setApi(_api);
      } catch (e) {
        setError(e);
      }
    };
    if (window.JitsiMeetExternalAPI) load();
    else {
      const int = setInterval(() => {
        if (window.JitsiMeetExternalAPI) {
          clearInterval(int);
          load();
        }
      }, 300);
    }
    return () => api?.dispose?.();
  }, [roomName]);

  return { iframeRef, api, error };
}
