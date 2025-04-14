<script>
    import { onMount } from 'svelte';
    
    let username = '';
    let password = '';

    async function handleFormSubmit() {

        try {
            const response = await fetch(import.meta.env.VITE_BACKEND_URL + '/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                mode: 'cors',
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Login successful:', data);
                // Handle successful login (e.g., redirect or show a success message)
            } else {
                throw new Error('Login failed');
            }
        } catch (error) {
            console.error('Error:', error);
            // Handle error (e.g., show an error message)
        }
    }

    onMount(() => {
        const form = document.querySelector('form');
        if (form) {
            form.addEventListener('submit', async (event) => {
                event.preventDefault();
                // prevent default and avoid the other default behavior, which is to refresh the page
                await handleFormSubmit();
            }); 
        } else {
            console.error('Form not found');
        }
    });
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center">
    <div class="max-w-lg mx-auto bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 p-8 rounded-xl shadow-2xl">
        <h1 class="text-4xl font-bold text-center mb-8 text-white">Welcome Back</h1>
        <form class="space-y-6">
            <div>
                <label for="username" class="block text-sm font-semibold text-white mb-2">Username</label>
                <input
                    id="username"
                    type="text"
                    bind:value={username}
                    class="w-full px-4 py-3 border border-yellow-300 rounded-lg bg-yellow-100 text-blue-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Enter your username"
                />
            </div>
            <div>
                <label for="password" class="block text-sm font-semibold text-white mb-2">Password</label>
                <input
                    id="password"
                    type="password"
                    bind:value={password}
                    class="w-full px-4 py-3 border border-yellow-300 rounded-lg bg-yellow-100 text-blue-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Enter your password"
                />
            </div>
            <button
                type="submit"
                class="w-full py-3 px-6 bg-blue-800 text-yellow-300 font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
            >
                Login
            </button>
        </form>
    </div>
</div>