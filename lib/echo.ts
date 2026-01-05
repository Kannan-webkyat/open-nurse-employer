import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

declare global {
    interface Window {
        Pusher: any
        Echo: Echo<any>
    }
}

if (typeof window !== 'undefined') {
    window.Pusher = Pusher
}

const createEcho = (token: string) => {
    return new Echo({
        broadcaster: 'reverb',
        key: process.env.NEXT_PUBLIC_REVERB_APP_KEY || 'app-key',
        wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || 'localhost',
        wsPort: process.env.NEXT_PUBLIC_REVERB_PORT ? parseInt(process.env.NEXT_PUBLIC_REVERB_PORT) : 8080,
        wssPort: process.env.NEXT_PUBLIC_REVERB_PORT ? parseInt(process.env.NEXT_PUBLIC_REVERB_PORT) : 8080,
        forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME || 'http') === 'https',
        enabledTransports: ['ws', 'wss'],
        authEndpoint: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/broadcasting/auth`,
        auth: {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
            },
        },
    })
}

export default createEcho
