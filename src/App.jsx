// ---------- Élèves & Paiements (comptable) ----------
function StudentsView({ students, paidByStudent, currency, readOnly, parents, subscribed, studentLimit, onAdd, onDelete, onPay, onLink }) {
  const grouped = useMemo(() => {
    const byLevel = {};
    LEVELS.forEach((lvl) => (byLevel[lvl] = {}));
    students.forEach((s) => {
      const lvl = LEVELS.includes(s.level) ? s.level : "Élémentaire";
      if (!byLevel[lvl][s.class_name]) byLevel[lvl][s.class_name] = [];
      byLevel[lvl][s.class_name].push(s);
    });
    return byLevel;
  }, [students]);

  const parentName = (id) => parents.find((p) => p.user_id === id)?.full_name;

  const exportCsv = () => {
    const rows = [["Niveau", "Classe", "Élève", "Parent lié", "Total dû", "Payé", "Reste"]];
    students.forEach((s) => {
      const paid = paidByStudent[s.id] || 0;
      rows.push([s.level, s.class_name, s.full_name, parentName(s.parent_id) || "—", s.total_due, paid, Number(s.total_due) - paid]);
    });
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `eleves_paiements_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-extrabold" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>Élèves & Paiements</h1>
          <p style={{ color: COLORS.inkSoft }}>Registre par niveau et par classe.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={exportCsv} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-medium text-sm" style={{ background: "#fff", color: COLORS.ink, border: `1px solid ${COLORS.line}` }}>
            <FileSpreadsheet size={16} /> Exporter (Excel)
          </button>
          {!readOnly && (
            <>
              <AddButton onClick={onAdd} label="Élève" />
              <button onClick={onPay} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-medium text-sm" style={{ background: COLORS.ink, color: "#fff" }}><Plus size={16} /> Paiement</button>
            </>
          )}
        </div>
      </div>

      {!subscribed && (
        <div className="rounded-xl px-4 py-3 mb-5 text-sm flex items-center justify-between flex-wrap gap-2" style={{ background: COLORS.primarySoft, color: COLORS.primary }}>
          <span>Essai gratuit : <b>{students.length}/{studentLimit}</b> élèves utilisés</span>
        </div>
      )}

      {students.length === 0 ? (
        <div className="rounded-2xl p-10" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}><EmptyState text="Aucun élève enregistré." /></div>
      ) : (
        <div className="space-y-6">
          {LEVELS.filter((lvl) => Object.keys(grouped[lvl]).length > 0).map((lvl) => (
            <div key={lvl}>
              <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: COLORS.primary, fontFamily: "'Manrope', sans-serif" }}>{lvl}</h2>
              <div className="space-y-4">
                {Object.entries(grouped[lvl]).map(([className, classStudents]) => (
                  <div key={className} className="rounded-2xl overflow-x-auto" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
                    <div className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider" style={{ background: COLORS.paper, color: COLORS.inkSoft }}>{className}</div>
                    <table className="w-full text-sm">
                      <tbody>
                        {classStudents.map((s, i) => {
                          const paid = paidByStudent[s.id] || 0;
                          const reste = Number(s.total_due) - paid;
                          return (
                            <tr key={s.id} style={{ borderTop: i === 0 ? "none" : `1px solid ${COLORS.line}` }}>
                              <td className="px-4 py-3 font-medium" style={{ color: COLORS.ink }}>
                                {s.full_name}
                                <div className="text-xs font-normal mt-0.5" style={{ color: s.parent_id ? COLORS.positive : COLORS.gold || COLORS.primary }}>
                                  {s.parent_id ? `Parent: ${parentName(s.parent_id) || "lié"}` : "Aucun parent lié"}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right" style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.positive }}>{fmt(paid, currency)}</td>
                              <td className="px-4 py-3 text-right font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: reste > 0 ? COLORS.negative : COLORS.positive }}>{fmt(reste, currency)}</td>
                              {!readOnly && (
                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                  <button onClick={() => onLink(s)} className="text-xs font-medium px-2 py-1 rounded-full mr-2" style={{ background: COLORS.primarySoft, color: COLORS.primary }}>Lier parent</button>
                                  <button onClick={() => onDelete(s.id)} style={{ color: COLORS.inkSoft }}><Trash2 size={15} /></button>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function StudentsReadOnlyView({ students }) {
  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-1" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>Élèves</h1>
      <p className="mb-6" style={{ color: COLORS.inkSoft }}>Liste des élèves par classe.</p>
      {students.length === 0 ? <EmptyState text="Aucun élève enregistré." /> : (
        <div className="grid sm:grid-cols-2 gap-3">
          {students.map((s) => (
            <div key={s.id} className="rounded-xl p-4" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
              <div className="font-semibold" style={{ color: COLORS.ink }}>{s.full_name}</div>
              <div className="text-sm" style={{ color: COLORS.inkSoft }}>{s.class_name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Devoirs (enseignant) ----------
function LessonsTeacherView({ lessons, students, homework, readOnly, onAdd, onDelete, onToggle }) {
  const [expanded, setExpanded] = useState(null);
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>Devoirs</h1>
          <p style={{ color: COLORS.inkSoft }}>Publiez des leçons/devoirs et suivez qui les a faits.</p>
        </div>
        {!readOnly && <AddButton onClick={onAdd} label="Publier" />}
      </div>
      {lessons.length === 0 ? (
        <div className="rounded-2xl p-10" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}><EmptyState text="Aucun devoir publié pour l'instant." /></div>
      ) : (
        <div className="space-y-3">
          {lessons.map((l) => {
            const classStudents = students.filter((s) => s.class_name === l.class_name);
            const doneCount = classStudents.filter((s) => homework.find((h) => h.lesson_id === l.id && h.student_id === s.id && h.done)).length;
            return (
              <div key={l.id} className="rounded-2xl p-5" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <div className="font-semibold" style={{ color: COLORS.ink }}>{l.title}</div>
                    <div className="text-xs" style={{ color: COLORS.inkSoft }}>{l.class_name}{l.due_date && ` · Pour le ${new Date(l.due_date).toLocaleDateString("fr-FR")}`}</div>
                  </div>
                  {!readOnly && <button onClick={() => onDelete(l.id)} style={{ color: COLORS.inkSoft }}><Trash2 size={15} /></button>}
                </div>
                {l.description && <p className="text-sm mt-2 mb-3" style={{ color: COLORS.inkSoft }}>{l.description}</p>}
                {l.attachment_url && (
                  <a href={l.attachment_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg mb-3" style={{ background: COLORS.primarySoft, color: COLORS.primary }}>
                    <FileText size={13} /> {l.attachment_name || "Voir le fichier"}
                  </a>
                )}
                <button onClick={() => setExpanded(expanded === l.id ? null : l.id)} className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: COLORS.positiveSoft, color: COLORS.positive }}>
                  {doneCount}/{classStudents.length} élèves ont terminé
                </button>
                {expanded === l.id && (
                  <div className="mt-3 pt-3 space-y-1.5" style={{ borderTop: `1px solid ${COLORS.line}` }}>
                    {classStudents.map((s) => {
                      const done = homework.find((h) => h.lesson_id === l.id && h.student_id === s.id)?.done;
                      return (
                        <div key={s.id} className="flex items-center justify-between text-sm">
                          <span style={{ color: COLORS.ink }}>{s.full_name}</span>
                          {done ? <Check size={15} style={{ color: COLORS.positive }} /> : <Clock size={15} style={{ color: COLORS.inkSoft }} />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------- Devoirs (parent) ----------
function LessonsParentView({ lessons, children, homework, onToggle }) {
  const childClasses = new Set(children.map((c) => c.class_name));
  const relevant = lessons.filter((l) => childClasses.has(l.class_name));
  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-1" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>Devoirs</h1>
      <p className="mb-6" style={{ color: COLORS.inkSoft }}>Devoirs de vos enfants — cochez une fois terminés.</p>
      {relevant.length === 0 ? <EmptyState text="Aucun devoir pour le moment." /> : (
        <div className="space-y-3">
          {relevant.map((l) => (
            <div key={l.id} className="rounded-2xl p-5" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
              <div className="font-semibold mb-1" style={{ color: COLORS.ink }}>{l.title}</div>
              <div className="text-xs mb-2" style={{ color: COLORS.inkSoft }}>{l.class_name}{l.due_date && ` · Pour le ${new Date(l.due_date).toLocaleDateString("fr-FR")}`}</div>
              {l.description && <p className="text-sm mb-3" style={{ color: COLORS.inkSoft }}>{l.description}</p>}
              {l.attachment_url && (
                <a href={l.attachment_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg mb-3" style={{ background: COLORS.primarySoft, color: COLORS.primary }}>
                  <FileText size={13} /> {l.attachment_name || "Voir le fichier"}
                </a>
              )}
              {children.filter((c) => c.class_name === l.class_name).map((c) => {
                const done = homework.find((h) => h.lesson_id === l.id && h.student_id === c.id)?.done;
                return (
                  <button key={c.id} onClick={() => onToggle(l.id, c.id)} className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm mt-1" style={{ background: done ? COLORS.positiveSoft : COLORS.paper, color: done ? COLORS.positive : COLORS.inkSoft }}>
                    <span>{c.full_name}</span>
                    <span className="flex items-center gap-1.5 font-medium">{done ? <><Check size={14} /> Fait</> : "Marquer comme fait"}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Mes enfants (parent dashboard) ----------
function ParentChildrenView({ children, paidByStudent, currency }) {
  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-1" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>Mes enfants</h1>
      <p className="mb-6" style={{ color: COLORS.inkSoft }}>Suivi scolaire et financier.</p>
      {children.length === 0 ? (
        <div className="rounded-2xl p-10" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
          <EmptyState text="Aucun enfant lié à votre compte pour l'instant. Demandez au comptable ou au fondateur de l'école de vous associer à votre enfant." />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {children.map((c) => {
            const paid = paidByStudent[c.id] || 0;
            const reste = Number(c.total_due) - paid;
            return (
              <div key={c.id} className="rounded-2xl p-5" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
                <div className="font-bold text-lg mb-1" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>{c.full_name}</div>
                <div className="text-sm mb-3" style={{ color: COLORS.inkSoft }}>{c.class_name}</div>
                <div className="flex justify-between text-sm"><span style={{ color: COLORS.inkSoft }}>Payé</span><span style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.positive }}>{fmt(paid, currency)}</span></div>
                <div className="flex justify-between text-sm mt-1"><span style={{ color: COLORS.inkSoft }}>Reste</span><span style={{ fontFamily: "'IBM Plex Mono', monospace", color: reste > 0 ? COLORS.negative : COLORS.positive }}>{fmt(reste, currency)}</span></div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------- Annonces ----------
function AnnouncementsView({ announcements, canWrite, onAdd, onDelete }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold" style={{ fontFamily: "'Manrope', sans-serif", color: COLORS.ink }}>Annonces</h1>
          <p style={{ color: COLORS.inkSoft }}>Communications de la direction.</p>
        </div>
        {canWrite && <AddButton onClick={onAdd} label="Publier" />}
      </div>
      {announcements.length === 0 ? (
        <div className="rounded-2xl p-10" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}><EmptyState text="Aucune annonce pour l'instant." /></div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <div key={a.id} className="rounded-2xl p-5" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold" style={{ color: COLORS.ink }}>{a.title}</div>
                  <div className="text-xs mb-2" style={{ color: COLORS.inkSoft }}>{new Date(a.created_at).toLocaleDateString("fr-FR")}</div>
                </div>
                {canWrite && <button onClick={() => onDelete(a.id)} style={{ color: COLORS.inkSoft }}><Trash2 size={15} /></button>}
              </div>
              <p className="text-sm" style={{ color: COLORS.inkSoft }}>{a.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Modals ----------
function StudentModal({ onClose, onSave }) {
  const [fullName, setFullName] = useState("");
  const [level, setLevel] = useState(LEVELS[1]);
  const [className, setClassName] = useState("");
  const [totalDue, setTotalDue] = useState("");
  const submit = async () => { if (!fullName.trim() || !className.trim()) return; await onSave({ full_name: fullName.trim(), level, class_name: className.trim(), total_due: parseFloat(totalDue) || 0 }); onClose(); };
  return (
    <Modal title="Nouvel élève" onClose={onClose}>
      <div className="space-y-4">
        <div><FieldLabel>Nom complet</FieldLabel><input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} /></div>
        <div>
          <FieldLabel>Niveau</FieldLabel>
          <div className="grid grid-cols-2 gap-2">
            {LEVELS.map((lvl) => (
              <button key={lvl} onClick={() => setLevel(lvl)} className="px-3 py-2 rounded-lg text-sm font-medium" style={{ background: level === lvl ? COLORS.ink : "#fff", color: level === lvl ? "#fff" : COLORS.inkSoft, border: `1px solid ${level === lvl ? COLORS.ink : COLORS.line}` }}>{lvl}</button>
            ))}
          </div>
        </div>
        <div><FieldLabel>Classe</FieldLabel><input value={className} onChange={(e) => setClassName(e.target.value)} placeholder="Ex: CM2, 6ème A..." className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} /></div>
        <div><FieldLabel>Montant total dû (année)</FieldLabel><input type="number" value={totalDue} onChange={(e) => setTotalDue(e.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} /></div>
        <button onClick={submit} className="w-full py-3 rounded-lg font-semibold mt-2" style={{ background: COLORS.ink, color: "#fff" }}>Ajouter l'élève</button>
      </div>
    </Modal>
  );
}

function UpgradeModal({ onClose }) {
  const [copied, setCopied] = useState(false);
  const copyNumber = () => {
    navigator.clipboard?.writeText(ORANGE_MONEY_NUMBER);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Modal title="Limite de l'essai gratuit atteinte" onClose={onClose}>
      <div className="space-y-5">
        <p className="text-sm" style={{ color: COLORS.inkSoft }}>
          L'essai gratuit permet d'enregistrer jusqu'à 10 élèves. Choisis une formule pour continuer :
        </p>
        <div className="space-y-2.5">
          {PRICING_TIERS.map((t) => (
            <div key={t.name} className="rounded-xl p-4 flex items-center justify-between" style={{ border: `1px solid ${COLORS.line}` }}>
              <div>
                <div className="font-semibold" style={{ color: COLORS.ink }}>{t.name}</div>
                <div className="text-xs" style={{ color: COLORS.inkSoft }}>{t.desc}</div>
              </div>
              <div className="text-right">
                <div className="font-bold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: COLORS.primary }}>{fmt(t.price, "GNF")}</div>
                <div className="text-xs" style={{ color: COLORS.inkSoft }}>/ mois</div>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl p-4" style={{ background: COLORS.primarySoft }}>
          <div className="flex items-center gap-2 mb-2">
            <Smartphone size={16} style={{ color: COLORS.primary }} />
            <span className="text-sm font-semibold" style={{ color: COLORS.primary }}>Paiement par Orange Money</span>
          </div>
          <p className="text-xs mb-3" style={{ color: COLORS.inkSoft }}>
            Envoie le montant de la formule choisie à ce numéro, puis contacte l'é
