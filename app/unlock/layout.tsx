/**
 * Unlock page uses a minimal layout — no Header/Footer.
 * We override RootLayout's chrome by rendering as a separate route group
 * visually, but still inherit <html>, fonts, and ToastProvider.
 */
export default function UnlockLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-10">
      {/* Decorative floating blobs — handled by the form itself, but we
          keep layout clean & centered. */}
      {children}
    </div>
  );
}
