/**
 * Amazon Associates program disclosure (FTC / program policy).
 * Render once per shop view; styled to be visible but unobtrusive.
 */
export default function AmazonAssociateNotice() {
  return (
    <p
      className="text-center text-xs text-gray-500 mt-10 pt-6 border-t border-gray-200 max-w-2xl mx-auto leading-relaxed"
      role="note"
    >
      As an Amazon Associate, I earn from qualifying purchases.
    </p>
  );
}
