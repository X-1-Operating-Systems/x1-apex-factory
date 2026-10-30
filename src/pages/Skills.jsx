import React, { useMemo, useState } from 'react';
import { Loader2, Plus, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import SkillCard from '@/components/skills/SkillCard';
import SkillFormDialog from '@/components/skills/SkillFormDialog';
import PersonalizationPanel from '@/components/skills/PersonalizationPanel';
import { CORE_SKILLS, skillCategoryLabel } from '@/lib/skills';

const bySkillId = (page) => page.items;

export default function Skills() {
  const { toast } = useToast();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    const page = await base44.entities.StudioSkill.list('-created_date', 50);
    setSkills(bySkillId(page));
  };

  React.useEffect(() => {
    load()
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const installed = useMemo(
    () => new Set(skills.map((skill) => skill.installed_from).filter(Boolean)),
    [skills]
  );

  const save = async (values) => {
    setSaving(true);
    try {
      if (editing) await base44.entities.StudioSkill.update(editing.id, values);
      else await base44.entities.StudioSkill.create(values);
      await load();
      setFormOpen(false);
      setEditing(null);
      toast({ title: editing ? 'Skill updated' : 'Skill created' });
    } catch (err) {
      toast({ title: 'Could not save the skill', description: err?.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (skill, enabled) => {
    setSkills((prev) => prev.map((item) => (item.id === skill.id ? { ...item, enabled } : item)));
    await base44.entities.StudioSkill.update(skill.id, { enabled });
  };

  const remove = async (skill) => {
    await base44.entities.StudioSkill.delete(skill.id);
    await load();
    toast({ title: 'Skill deleted' });
  };

  const install = async (preset) => {
    await base44.entities.StudioSkill.create({
      name: preset.name,
      description: preset.description,
      category: preset.category,
      instructions: preset.instructions,
      enabled: true,
      installed_from: preset.id,
    });
    await load();
    toast({ title: `${preset.name} enabled`, description: 'It now applies to every run.' });
  };

  const enabledCount = skills.filter((skill) => skill.enabled).length;

  return (
    <div className="mx-auto w-full max-w-[1000px] px-5 py-8 lg:px-10 lg:py-10">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="text-[15px] font-medium">Skills</h1>
          <p className="mt-1.5 max-w-[64ch] text-[11.5px] leading-relaxed text-muted-foreground">
            Reusable rules the studio applies to every task. {enabledCount} of {skills.length || 0} enabled.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          className="glass-blue inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-medium"
        >
          <Plus size={13} /> New skill
        </button>
      </div>

      {loading ? (
        <div className="grid place-items-center py-16">
          <Loader2 size={18} className="animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="mt-4 grid gap-4 lg:grid-cols-[1.35fr_1fr]">
          <div className="space-y-4">
            <div>
              <p className="text-[11.5px] font-medium">Your skills</p>
              {skills.length === 0 ? (
                <div className="mt-2 rounded-xl border border-border bg-card px-4 py-7 text-center">
                  <Sparkles size={17} className="mx-auto text-muted-foreground" />
                  <p className="mt-2 text-[12px] font-medium">No skills yet</p>
                  <p className="mx-auto mt-1 max-w-xs text-[11.5px] leading-relaxed text-muted-foreground">
                    Add one from the list below, or write your own rule.
                  </p>
                </div>
              ) : (
                <div className="mt-2 grid gap-2.5">
                  {skills.map((skill) => (
                    <SkillCard
                      key={skill.id}
                      skill={skill}
                      onToggle={toggle}
                      onEdit={(item) => {
                        setEditing(item);
                        setFormOpen(true);
                      }}
                      onDelete={remove}
                    />
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="text-[11.5px] font-medium">Suggested skills</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Curated rules you can switch on in one click.
              </p>
              <div className="mt-2 divide-y divide-border rounded-xl border border-border bg-card">
                {CORE_SKILLS.map((preset) => (
                  <div key={preset.id} className="flex items-center gap-3 px-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-medium">{preset.name}</p>
                      <p className="truncate text-[10.5px] text-muted-foreground">
                        {skillCategoryLabel(preset.category)} · {preset.description}
                      </p>
                    </div>
                    {installed.has(preset.id) ? (
                      <span className="shrink-0 text-[10.5px] text-muted-foreground">Enabled</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => install(preset)}
                        className="shrink-0 rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      >
                        Add
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <PersonalizationPanel />
        </div>
      )}

      <SkillFormDialog
        open={formOpen}
        onOpenChange={(next) => {
          setFormOpen(next);
          if (!next) setEditing(null);
        }}
        skill={editing}
        onSubmit={save}
        busy={saving}
      />
    </div>
  );
}