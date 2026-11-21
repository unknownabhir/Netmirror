export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cinema-bg">
      <div className="w-full max-w-md p-8 bg-cinema-panel rounded-lg border border-cinema-border">
        <h1 className="text-2xl font-bold mb-6 text-center">Watch Movie <span className="text-brand">Admin</span></h1>
        <form className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="Enter Admin Password"
            className="p-3 bg-cinema-bg border border-cinema-border rounded text-white"
          />
          <button className="bg-brand text-white p-3 rounded font-bold hover:bg-brand-hover">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
