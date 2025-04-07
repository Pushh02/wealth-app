import { login, signup } from "@/app/login/action";

export default function LoginPage() {
  return (
    <form className="w-full max-w-md mx-auto mt-10 space-y-6 bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-white">
        Welcome Back
      </h2>

      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          formAction={login}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition"
        >
          Log in
        </button>
        <button
          formAction={signup}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition"
        >
          Sign up
        </button>
      </div>
    </form>
  );
}
