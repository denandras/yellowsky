            {/* Name at image edge - 20px from bottom */}
            <div className="absolute bottom-5 left-0 right-0 pointer-events-none">
              <div className="px-6 md:px-8">
                <div className="flex items-center gap-3">
                  <div className="h-px w-12 bg-primary" />
                  {labels.subtitleLink ? (
                    <a
                      href={labels.subtitleLink}
                      className="font-display text-xl font-bold tracking-[0.1em] text-primary underline decoration-primary/30 underline-offset-2 transition-colors hover:text-primary/80 uppercase"
                    >
                      {labels.subtitle}
                    </a>
                  ) : (
                    <p className="font-display text-xl font-bold tracking-[0.1em] text-primary uppercase">
                      {labels.subtitle}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Title below hero - aligned with content baseline */}
          <div className="px-3 pt-6">
            <div className="mx-auto max-w-2xl px-6 md:px-8">
              <h1 className="font-display text-[5.5rem] md:text-[6.9rem] font-bold leading-none tracking-tighter text-left text-text-dark">
                {labels.title}
              </h1>
            </div>
          </div>

          {/* Story - all paragraphs with consistent spacing */}