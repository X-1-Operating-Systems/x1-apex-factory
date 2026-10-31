import React, { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Languages, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminGate from '@/components/video/AdminGate';
import VoiceCatalog from '@/components/voice/VoiceCatalog';
import SpeakPanel from '@/components/voice/SpeakPanel';
import ClonePanel from '@/components/voice/ClonePanel';
import RenderHistory from '@/components/voice/RenderHistory';
import { voiceCall, voiceData } from '@/lib/voiceApi';

export default function VoiceStudio() {
  const [isAdmin, setIsAdmin] = useState(null);
  const [voices, setVoices] = useState([]);
  const [emotions, setEmotions] = useState(['neutral']);
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState('preset:river');
  const [language, setLanguage] = useState('');
  const [installing, setInstalling] = useState(false);
  const [notice, setNotice] = useState(null);

  const loadVoices = useCallback(async () => {
    const result = await voiceCall('voices');
    const payload = voiceData(result);
    setVoices(payload?.voices || []);
    setEmotions(payload?.emotions || ['neutral']);
  }, []);

  const loadHistory = useCallback(async () => {
    const result = await voiceCall('history', { limit: 30 });
    setHistory(voiceData(result)?.items || []);
  }, []);

  useEffect(() => {
    base44.auth
      .me()
      .then((user) => setIsAdmin(user?.role === 'admin'))
      .catch(() => setIsAdmin(false));
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    loadVoices();
    loadHistory();
  }, [isAdmin, loadVoices, loadHistory]);

  const install = async () => {
    const key = language.trim();
    if (!key) return;
    setInstalling(true);
    setNotice(null);
    const result = await voiceCall('install', { voice: key });
    setInstalling(false);
    if (!result?.ok) {
      setNotice(result?.error || 'That model was not installed.');
      return;
    }
    setNotice(`${key} is on the volume now.`);
    setLanguage('');
    loadVoices();
  };

  if (isAdmin === null) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 size={18} className="animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!isAdmin) return <AdminGate />;

  const clones = voices.filter((voice) => voice.kind === 'clone');
  const models = voices.filter((voice) => voice.kind !== 'clone');

  return (
    <div className="mx-auto w-full max-w-[980px] px-5 py-8">
      <header>
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Owned stack</p>
        <h1 className="mt-1 display-title text-[26px]">Voice studio</h1>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
          Your own speech engine on your own container: {models.length} voices, {clones.length} cloned, real pauses,
          emotion and prosody. No vendor, no per-word billing.
        </p>
      </header>

      <Tabs defaultValue="studio" className="mt-6">
        <TabsList>
          <TabsTrigger value="studio">Studio</TabsTrigger>
          <TabsTrigger value="voices">Voices</TabsTrigger>
          <TabsTrigger value="clones">Clones</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="studio" className="mt-4 space-y-4">
          <VoiceCatalog voices={voices} selectedId={selected} onSelect={setSelected} />
          <SpeakPanel voiceId={selected} emotions={emotions} onRendered={loadHistory} />
        </TabsContent>

        <TabsContent value="voices" className="mt-4 space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="flex items-center gap-1.5 text-[12.5px] font-medium">
              <Languages size={13} /> Add a language
            </p>
            <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">
              Any Piper model installs onto the volume at runtime — no rebuild. Try es_ES-davefx-medium,
              fr_FR-siwis-medium, de_DE-thorsten-medium or en_GB-alba-medium.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                placeholder="locale-name-quality"
                className="h-8 min-w-[200px] flex-1 rounded-md border border-input bg-background px-2 text-[12px] outline-none focus:ring-1 focus:ring-ring"
              />
              <Button size="sm" onClick={install} disabled={installing} className="gap-1.5">
                {installing && <Loader2 size={13} className="animate-spin" />}
                {installing ? 'Installing' : 'Install'}
              </Button>
            </div>
            {notice && <p className="mt-2 text-[11.5px] text-muted-foreground">{notice}</p>}
          </div>
          <VoiceCatalog voices={models} selectedId={selected} onSelect={setSelected} />
        </TabsContent>

        <TabsContent value="clones" className="mt-4">
          <ClonePanel clones={clones} onChanged={loadVoices} />
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <RenderHistory items={history} onChanged={loadHistory} />
        </TabsContent>
      </Tabs>
    </div>
  );
}