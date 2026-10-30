import React, { useEffect, useRef, useState } from 'react';
import { Room, RoomEvent } from 'livekit-client';
import { Loader2, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

// The avatar is published into a LiveKit room, so this component is the player: it joins the
// room with the client token the session returned, renders the avatar's video and audio tracks,
// and publishes the microphone when you want the avatar to answer you.
export default function AvatarStage({ url, token, mode = 'FULL', onLeave }) {
  const videoHostRef = useRef(null);
  const audioHostRef = useRef(null);
  const roomRef = useRef(null);
  const [state, setState] = useState('connecting');
  const [error, setError] = useState(null);
  const [micOn, setMicOn] = useState(false);
  const [micBusy, setMicBusy] = useState(false);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const [avatarOnline, setAvatarOnline] = useState(false);

  useEffect(() => {
    if (!url || !token) return undefined;
    const room = new Room({ adaptiveStream: true, dynacast: true });
    roomRef.current = room;

    const attachVideo = (track) => {
      const element = track.attach();
      element.className = 'h-full w-full object-contain';
      element.setAttribute('playsinline', 'true');
      if (videoHostRef.current) {
        videoHostRef.current.innerHTML = '';
        videoHostRef.current.appendChild(element);
      }
      setAvatarOnline(true);
      setState('live');
    };

    const attachAudio = (track) => {
      const element = track.attach();
      element.autoplay = true;
      if (audioHostRef.current) audioHostRef.current.appendChild(element);
      room.startAudio().then(() => setAudioBlocked(false)).catch(() => setAudioBlocked(true));
    };

    const attachAll = () => {
      room.remoteParticipants.forEach((participant) => {
        participant.trackPublications.forEach((publication) => {
          if (!publication.track || !publication.isSubscribed) return;
          if (publication.track.kind === 'video') attachVideo(publication.track);
          if (publication.track.kind === 'audio') attachAudio(publication.track);
        });
      });
    };

    room.on(RoomEvent.TrackSubscribed, (track) => {
      if (track.kind === 'video') attachVideo(track);
      if (track.kind === 'audio') attachAudio(track);
    });
    room.on(RoomEvent.ParticipantConnected, () => window.setTimeout(attachAll, 400));
    room.on(RoomEvent.Connected, () => {
      setState('live');
      attachAll();
      room.startAudio().catch(() => setAudioBlocked(true));
    });
    room.on(RoomEvent.AudioPlaybackStatusChanged, () => setAudioBlocked(!room.canPlaybackAudio));
    room.on(RoomEvent.Disconnected, () => {
      setState('closed');
      setAvatarOnline(false);
      if (onLeave) onLeave();
    });

    room
      .connect(url, token)
      .then(() => {
        setState('live');
        attachAll();
        room.startAudio().catch(() => setAudioBlocked(true));
      })
      .catch((reason) => {
        setState('error');
        setError(reason?.message || 'The room refused the connection.');
      });

    return () => {
      room.disconnect().catch(() => {});
      roomRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, token]);

  const toggleMic = async () => {
    const room = roomRef.current;
    if (!room) return;
    setMicBusy(true);
    setError(null);
    try {
      await room.localParticipant.setMicrophoneEnabled(!micOn);
      setMicOn(!micOn);
    } catch (reason) {
      setError(reason?.message || 'The microphone could not be opened.');
    } finally {
      setMicBusy(false);
    }
  };

  const enableSound = async () => {
    const room = roomRef.current;
    if (!room) return;
    try {
      await room.startAudio();
      setAudioBlocked(false);
    } catch (reason) {
      setError(reason?.message || 'Sound could not be enabled.');
    }
  };

  const label =
    state === 'connecting'
      ? 'Joining the room…'
      : state === 'error'
        ? 'Not connected'
        : state === 'closed'
          ? 'Room closed'
          : avatarOnline
            ? 'Live'
            : 'Waiting for the avatar…';

  return (
    <div className="overflow-hidden rounded-md border border-border bg-black">
      <div className="relative aspect-video w-full">
        <div ref={videoHostRef} className="absolute inset-0" />
        <div ref={audioHostRef} className="hidden" />

        {!avatarOnline && (
          <div className="absolute inset-0 grid place-items-center text-center">
            {state === 'connecting' || state === 'live' ? (
              <span className="flex items-center gap-1.5 text-[11px] text-white/70">
                <Loader2 size={11} className="animate-spin" /> {label}
              </span>
            ) : (
              <span className="px-4 text-[11px] leading-relaxed text-white/70">
                {error || 'The session is over. Start a new one to bring the avatar back.'}
              </span>
            )}
          </div>
        )}

        <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded-full bg-black/55 px-2 py-[3px] text-[10px] text-white/85 backdrop-blur">
          <span
            className={`h-1.5 w-1.5 rounded-full ${avatarOnline ? 'bg-emerald-400' : state === 'error' ? 'bg-red-400' : 'bg-white/50'}`}
          />
          {label} · {mode}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 border-t border-white/10 px-2 py-1.5">
        <Button
          size="sm"
          variant={micOn ? 'default' : 'outline'}
          className="h-7 rounded-full px-2.5 text-[10.5px]"
          disabled={micBusy || !avatarOnline}
          onClick={toggleMic}
        >
          {micBusy ? (
            <Loader2 size={10} className="mr-1 animate-spin" />
          ) : micOn ? (
            <Mic size={10} className="mr-1" />
          ) : (
            <MicOff size={10} className="mr-1" />
          )}
          {micOn ? 'Mic on' : 'Talk to the avatar'}
        </Button>

        {audioBlocked && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 rounded-full px-2.5 text-[10.5px]"
            onClick={enableSound}
          >
            <Volume2 size={10} className="mr-1" /> Enable sound
          </Button>
        )}

        {!audioBlocked && avatarOnline && (
          <span className="inline-flex items-center gap-1 text-[10px] text-white/50">
            <VolumeX size={9} /> Audio follows the browser volume
          </span>
        )}
      </div>

      {error && <p className="border-t border-white/10 px-2 py-1 text-[10px] text-red-300">{error}</p>}
    </div>
  );
}