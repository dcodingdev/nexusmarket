export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      <div className="prose prose-slate dark:prose-invert">
        <p className="lead text-lg text-muted-foreground mb-6">
          By accessing or using NexusMarket, you agree to be bound by these Terms of Service.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Account Responsibilities</h2>
        <p className="mb-4">
          You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Prohibited Activities</h2>
        <p className="mb-4">
          You may not use our services for any illegal or unauthorized purpose. This includes, but is not limited to, violating any intellectual property rights, distributing malicious code, or engaging in fraudulent activities.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Limitation of Liability</h2>
        <p className="mb-4">
          NexusMarket shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
        </p>
      </div>
    </div>
  );
}
