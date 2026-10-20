import { Link, Navigate, useNavigate } from 'react-router'
import { useAuth } from '../hook/useAuth';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';

const Login = () => {

    const {handleLogin} = useAuth();
    const navigate = useNavigate()
    const { register, handleSubmit, formState: { errors } } = useForm();

    const user = useSelector(state => state.auth.user)
    const loading = useSelector(state => state.auth.loading)

    const submitForm = async (values) => {
        await handleLogin(values);
        navigate('/')
    }

    if(!loading && user){
        return <Navigate to='/' replace/>
    }


  return (
     <section className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100 sm:px-6 lg:px-8">
            <div className="mx-auto flex min-h-[85vh] w-full max-w-5xl items-center justify-center">
                <div className="w-full max-w-md rounded-2xl border border-[#31b8c6]/40 bg-zinc-900/70 p-8 shadow-2xl shadow-black/50 backdrop-blur">
                    <h1 className="text-3xl font-bold text-[#31b8c6]">
                        Welcome Back
                    </h1>
                    <p className="mt-2 text-sm text-zinc-300">
                        Sign in with your email and password.
                    </p>

                    <form onSubmit={handleSubmit(submitForm)} className="mt-8 space-y-5">
                        <div>
                            <label htmlFor="email" className="mb-2 block text-sm font-medium text-zinc-200">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^\S+@\S+\.\S+$/,
                                        message: 'Enter a valid email address',
                                    },
                                })}
                                className="w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-zinc-100 outline-none ring-0 transition focus:border-[#31b8c6] focus:shadow-[0_0_0_3px_rgba(49,184,198,0.25)]"
                            />
                            {errors.email && (
                                <p role="alert" className="mt-2 text-sm text-red-400">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="mb-2 block text-sm font-medium text-zinc-200">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                {...register('password', {
                                    required: 'Password is required',
                                })}
                                className="w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-zinc-100 outline-none ring-0 transition focus:border-[#31b8c6] focus:shadow-[0_0_0_3px_rgba(49,184,198,0.25)]"
                            />
                            {errors.password && (
                                <p role="alert" className="mt-2 text-sm text-red-400">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="w-full rounded-lg bg-[#31b8c6] px-4 py-3 font-semibold text-zinc-950 transition hover:bg-[#45c7d4] focus:outline-none focus:shadow-[0_0_0_3px_rgba(49,184,198,0.35)]"
                        >
                            Login
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-zinc-300">
                        Don&apos;t have an account?{' '}
                        <Link to="/register" className="font-semibold text-[#31b8c6] transition hover:text-[#45c7d4]">
                            Register
                        </Link>
                    </p>
                </div>
            </div>
        </section>
  )
}

export default Login
