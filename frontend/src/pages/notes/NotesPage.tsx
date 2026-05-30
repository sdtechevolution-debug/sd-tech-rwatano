import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Bold, CheckSquare, Italic, Plus, StickyNote, Trash2, Underline } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

type TodoItem = {
  id: string;
  text: string;
  completed: boolean;
};

type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  todos: TodoItem[];
  authorId: string;
  authorName: string;
  authorRole: string;
};


const NotesPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [todoText, setTodoText] = useState("");
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem("sdtech_notes");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Note[];
        const normalized = parsed.map((n) => ({
          ...n,
          authorId: (n as any).authorId ?? "unknown",
          authorName: (n as any).authorName ?? "Unknown",
          authorRole: (n as any).authorRole ?? "WORKER",
        }));
        setNotes(normalized);
      } catch (error) {
        console.error("Failed to parse notes from localStorage", error);
      }
    }
  }, []);

  const persistNotes = (nextNotes: Note[]) => {
    setNotes(nextNotes);
    window.localStorage.setItem("sdtech_notes", JSON.stringify(nextNotes));
  };

  const visibleNotes = useMemo(() => {
    if (user?.role === "OWNER") return notes;
    return notes.filter((n) => n.authorId === user?.id);
  }, [notes, user]);

  const formatSelection = (wrapper: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end);
    const contentToInsert = selected || "text";
    const formatted = `${wrapper}${contentToInsert}${wrapper}`;

    setContent(`${content.slice(0, start)}${formatted}${content.slice(end)}`);

    const cursorStart = start + wrapper.length;
    const cursorEnd = cursorStart + contentToInsert.length;
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorStart, cursorEnd);
    }, 0);
  };

  const handleAddTodo = () => {
    const trimmed = todoText.trim();
    if (!trimmed) return;
    setTodos((prev) => [...prev, { id: crypto.randomUUID(), text: trimmed, completed: false }]);
    setTodoText("");
  };

  const handleToggleTodo = (id: string) => {
    setTodos((prev) => prev.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)));
  };

  const handleRemoveTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const handleAddNote = () => {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    if (!trimmedTitle && !trimmedContent && todos.length === 0) return;

    const newNote: Note = {
      id: crypto.randomUUID(),
      title: trimmedTitle || t("untitledNote"),
      content: trimmedContent,
      createdAt: new Date().toISOString(),
      todos,
      authorId: user?.id || "unknown",
      authorName: user?.name || "Unknown",
      authorRole: user?.role || "WORKER",
    };

    persistNotes([newNote, ...notes]);
    setTitle("");
    setContent("");
    setTodos([]);
    setTodoText("");
  };

  const handleDeleteNote = (id: string) => {
    const note = notes.find((n) => n.id === id);
    if (!note) return;
    if (user?.role !== "OWNER" && note.authorId !== user?.id) {
      alert(t("noPermission"));
      return;
    }
    persistNotes(notes.filter((note) => note.id !== id));
  };

  const renderFormattedText = (text: string): ReactNode => {
    const items = [] as ReactNode[];
    const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*|__([^_]+)__)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      const [fullMatch, , boldText, italicText, underlineText] = match;
      const matchStart = match.index;
      const matchEnd = regex.lastIndex;

      if (matchStart > lastIndex) {
        items.push(text.slice(lastIndex, matchStart));
      }

      if (boldText) {
        items.push(<strong key={matchStart}>{boldText}</strong>);
      } else if (italicText) {
        items.push(<em key={matchStart}>{italicText}</em>);
      } else if (underlineText) {
        items.push(<u key={matchStart}>{underlineText}</u>);
      } else {
        items.push(fullMatch);
      }

      lastIndex = matchEnd;
    }

    if (lastIndex < text.length) {
      items.push(text.slice(lastIndex));
    }

    return items;
  };

  const renderNoteContent = (contentText: string) => (
    <div className="space-y-2 text-sm leading-6 text-slate-900 dark:text-slate-100">
      {contentText.split("\n").map((line, index) => {
        if (line.startsWith("- [ ] ")) {
          return (
            <div key={index} className="flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 dark:bg-slate-950">
              <span className="text-slate-500">☐</span>
              <span>{renderFormattedText(line.slice(6))}</span>
            </div>
          );
        }

        if (line.startsWith("- [x] ")) {
          return (
            <div key={index} className="flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 dark:bg-slate-950">
              <span className="text-emerald-600">☑</span>
              <span className="line-through text-slate-500">{renderFormattedText(line.slice(6))}</span>
            </div>
          );
        }

        return (
          <p key={index} className="whitespace-pre-wrap">
            {renderFormattedText(line)}
          </p>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <StickyNote className="h-6 w-6 text-amber-600 dark:text-amber-400" />
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{t("notes")}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t("notesDescription")}</p>
        </div>
      </div>

      <div className="surface-card">
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t("noteTitle")}</label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={t("noteTitlePlaceholder")}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition duration-200 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-amber-500 dark:focus:ring-amber-500/20"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => formatSelection("**")}
              className="btn-secondary inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium"
            >
              <Bold className="h-4 w-4" />
              Bold
            </button>
            <button
              type="button"
              onClick={() => formatSelection("*")}
              className="btn-secondary inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium"
            >
              <Italic className="h-4 w-4" />
              Italic
            </button>
            <button
              type="button"
              onClick={() => formatSelection("__")}
              className="btn-secondary inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium"
            >
              <Underline className="h-4 w-4" />
              Underline
            </button>
            <button
              type="button"
              onClick={() => setContent((prev) => `${prev}\n- [ ] `)}
              className="btn-secondary inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium"
            >
              <CheckSquare className="h-4 w-4" />
              Todo
            </button>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t("noteContent")}</label>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder={t("notesPlaceholder")}
            rows={8}
            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-900 outline-none transition-shadow duration-200 placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-amber-500 dark:focus:ring-amber-500/20"
          />
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t("todoItems")}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t("todoPlaceholder")}</p>
            </div>
            <button
              type="button"
              onClick={handleAddTodo}
              className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600"
            >
              <Plus className="h-4 w-4" />
              {t("addTodo")}
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <input
              value={todoText}
              onChange={(event) => setTodoText(event.target.value)}
              placeholder={t("todoPlaceholder")}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition duration-200 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-amber-500 dark:focus:ring-amber-500/20"
            />
          </div>

          {todos.length > 0 && (
            <div className="mt-4 space-y-3">
              {todos.map((todo) => (
                <div key={todo.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-950">
                  <button
                    type="button"
                    onClick={() => handleToggleTodo(todo.id)}
                    className={`flex items-center gap-2 ${todo.completed ? "text-emerald-600" : "text-slate-700 dark:text-slate-200"}`}
                  >
                    <CheckSquare className="h-4 w-4" />
                    <span className={`${todo.completed ? "line-through text-slate-400" : ""}`}>{todo.text}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveTodo(todo.id)}
                    className="rounded-full border border-slate-200 bg-slate-100 p-2 text-slate-600 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-rose-500 dark:hover:bg-rose-500/10 dark:hover:text-rose-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleAddNote}
          className="mt-6 inline-flex items-center justify-center rounded-2xl bg-amber-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-950"
        >
          {t("addNote")}
        </button>
      </div>

      <div className="surface-card">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{t("savedNotes")}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{visibleNotes.length} {t("savedNotes")}</p>
          </div>
          <div className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-200">
            {visibleNotes.length}
          </div>
        </div>

        {visibleNotes.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            {t("noNotesYet")}
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {visibleNotes.map((note) => (
              <div key={note.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{note.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{t("noteDate")}: {new Date(note.createdAt).toLocaleString()}</p>
                    {user?.role === "OWNER" && (
                      <p className="text-sm text-slate-500 dark:text-slate-400">{note.authorName} ({note.authorRole})</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteNote(note.id)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-rose-500 dark:hover:bg-rose-500/10 dark:hover:text-rose-200"
                  >
                    <Trash2 className="h-4 w-4" />
                    {t("deleteNote")}
                  </button>
                </div>
                {note.content && (
                  <div className="mt-4 rounded-2xl bg-white p-4 text-sm leading-6 text-slate-900 shadow-sm dark:bg-slate-950 dark:text-slate-100">
                    {renderNoteContent(note.content)}
                  </div>
                )}
                {note.todos.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{t("todoItems")}</h4>
                    <div className="grid gap-2">
                      {note.todos.map((todo) => (
                        <div key={todo.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-950">
                          <span className={`${todo.completed ? "text-emerald-600 line-through" : "text-slate-900 dark:text-slate-100"}`}>
                            {todo.text}
                          </span>
                          <span className="ml-auto text-xs text-slate-500 dark:text-slate-400">
                            {todo.completed ? t("markComplete") : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesPage;
