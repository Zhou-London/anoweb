import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FanContext } from "../../Contexts/fan_context";
import { useEditMode } from "../../Contexts/edit_mode_context";
import { useErrorNotifier } from "../../Contexts/error_context";
import { apiJson } from "../../lib/api";
import type { VBookShort } from "./types";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function VBooksPage() {
  const { isAdmin } = useContext(FanContext);
  const { editMode } = useEditMode();
  const showAdminFeatures = isAdmin && editMode;
  const notifyError = useErrorNotifier();

  const [vbooks, setVBooks] = useState<VBookShort[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    apiJson<VBookShort[]>("/vbook", { credentials: "include" })
      .then((data) => {
        if (cancelled) return;
        setVBooks(data ?? []);
      })
      .catch((err) => {
        if (cancelled) return;
        notifyError(err, "Failed to load vBooks");
        setVBooks([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [notifyError]);

  const sorted = useMemo(() => {
    return [...vbooks].sort((a, b) => {
      if (a.order_index !== b.order_index) return a.order_index - b.order_index;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  }, [vbooks]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-wide"
          style={{ fontFamily: "'Bebas Neue', sans-serif", color: "var(--gb-fg)" }}
        >
          VBOOKS
        </h1>
        {showAdminFeatures && (
          <span
            className="text-xs px-3 py-1 rounded-full"
            style={{ background: "var(--gb-bg-soft)", color: "var(--gb-fg-muted)" }}
          >
            Click a vBook to edit
          </span>
        )}
      </div>

      <p className="text-sm sm:text-base" style={{ color: "var(--gb-fg-muted)" }}>
        Interactive walk-throughs of topics worth reading. Pick a vBook, work through
        the chapters, and the site tracks where you stopped — even across devices when
        you're logged in.
      </p>

      <section
        className="rounded-2xl sm:rounded-3xl shadow-lg p-3 sm:p-6 md:p-8"
        style={{ background: "var(--gb-bg)", boxShadow: "var(--gb-shadow-card)" }}
      >
        {isLoading ? (
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-xl sm:rounded-2xl animate-pulse"
                style={{ background: "var(--gb-bg-soft)" }}
              >
                <div
                  className="aspect-video rounded-t-xl sm:rounded-t-2xl"
                  style={{ background: "var(--gb-bg-muted)" }}
                />
                <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                  <div
                    className="h-3 sm:h-4 rounded w-3/4"
                    style={{ background: "var(--gb-bg-muted)" }}
                  />
                  <div
                    className="h-2 sm:h-3 rounded w-1/2"
                    style={{ background: "var(--gb-bg-muted)" }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div
            className="text-center py-10 sm:py-16 rounded-xl sm:rounded-2xl"
            style={{
              boxShadow: "var(--gb-shadow-inset)",
              background: "var(--gb-bg-soft)",
            }}
          >
            <div
              className="mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-3 sm:mb-4"
              style={{ background: "var(--gb-fg-muted)", color: "var(--gb-bg)" }}
            >
              <span className="text-2xl sm:text-3xl">📘</span>
            </div>
            <h3
              className="text-base sm:text-lg font-semibold mb-1 sm:mb-2"
              style={{ color: "var(--gb-fg)" }}
            >
              No vBooks yet
            </h3>
            <p className="text-sm" style={{ color: "var(--gb-fg-muted)" }}>
              Check back later for new content.
            </p>
          </div>
        ) : (
          <motion.div
            className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {sorted.map((vb) => (
              <motion.div
                key={vb.id}
                variants={itemVariants}
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  to={`/vbooks/${vb.id}`}
                  className="group block rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200"
                  style={{
                    background: "var(--gb-bg-soft)",
                    boxShadow: "var(--gb-shadow-card)",
                  }}
                >
                  <div
                    className="aspect-video overflow-hidden relative"
                    style={{ background: "var(--gb-bg-muted)" }}
                  >
                    {vb.cover_image_url ? (
                      <img
                        src={vb.cover_image_url}
                        alt={vb.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ background: "var(--gb-accent)" }}
                      >
                        <span className="text-5xl" style={{ color: "var(--gb-bg)" }}>
                          📘
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="p-4">
                    <h3
                      className="font-semibold leading-tight mb-2"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        wordBreak: "break-word",
                        color: "var(--gb-fg)",
                      }}
                      title={vb.title}
                    >
                      {vb.title}
                    </h3>
                    <p
                      className="text-xs"
                      style={{
                        color: "var(--gb-fg-muted)",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {vb.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
}
