export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      <div className="prose prose-slate dark:prose-invert">
        <p className="lead text-lg text-muted-foreground mb-6">
          Your privacy is important to us. This privacy policy explains how we collect, use, and protect your personal information.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Information We Collect</h2>
        <p className="mb-4">
          We collect information that you provide directly to us, such as when you create an account, make a purchase, or contact support. This may include your name, email address, shipping address, and payment information.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">How We Use Your Information</h2>
        <p className="mb-4">
          We use the information we collect to process transactions, communicate with you about your orders, and improve our services. We do not sell your personal information to third parties.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Data Security</h2>
        <p className="mb-4">
          We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.
        </p>
      </div>
    </div>
  );
}

