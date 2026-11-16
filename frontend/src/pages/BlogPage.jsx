import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Clock, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DOMPurify from 'dompurify';
import { blogData } from '../data/blogData';

export const BlogPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();

  if (id) {
    const article = blogData.find((a) => a.id === id);
    if (!article) {
      return (
        <div className="mx-auto max-w-3xl space-y-4 px-4 py-12 sm:px-6">
          <p className="text-sm text-muted-foreground">Artikel tidak ditemukan.</p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Kembali ke Edukasi
          </Link>
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6">
        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Kembali ke Edukasi
        </Link>

        <article className="overflow-hidden rounded-xl border border-border bg-surface">
          {article.img && (
            <img
              src={article.img}
              alt={article.title}
              loading="lazy"
              className="aspect-video w-full object-cover"
            />
          )}
          <div className="space-y-4 p-6 sm:p-8">
            <div className="flex flex-wrap gap-2">
              {article.categories?.map((cat) => (
                <span
                  key={cat}
                  className="rounded-md bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-primary"
                >
                  {cat}
                </span>
              ))}
            </div>

            <h1 className="text-2xl font-bold leading-snug text-foreground sm:text-3xl">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 border-b border-border pb-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <User className="h-3.5 w-3.5" aria-hidden="true" />
                {article.author}
              </span>
              <span>{article.date}</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                {article.readTime}
              </span>
            </div>

            <div
              className="prose prose-sm sm:prose-base max-w-none text-foreground prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-li:text-foreground"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(article.content),
              }}
            />
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t('blog.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('blog.subtitle')}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {blogData.map((article) => (
          <Link
            key={article.id}
            to={`/blog/${article.id}`}
            className="group flex flex-col justify-between rounded-xl border border-border bg-surface p-6 transition-colors hover:border-primary/50"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                <span className="font-semibold text-primary">
                  {article.categories?.[0] || 'Edukasi'}
                </span>
                <span>{article.readTime}</span>
              </div>
              <h2 className="mt-2 text-lg font-bold text-foreground group-hover:text-primary">
                {article.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {article.excerpt}
              </p>
            </div>

            <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
              <span>Baca selengkapnya</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
