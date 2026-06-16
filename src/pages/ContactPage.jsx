import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';

export const ContactPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setSuccess('Thank you for contacting us! We will get back to you shortly.');
        setName('');
        setEmail('');
        setMessage('');
    };

    return (
        <Layout>
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-white">
                        Contact <span className="text-yellow-500">Us</span>
                    </h1>
                    <p className="mt-2 text-sm text-gray-400">
                        Have questions or feedback? Drop us a line below.
                    </p>
                </div>

                <Alert type="success" message={success} className="mb-6" />

                <form onSubmit={handleSubmit} className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-4">
                    <Input
                        label="Your Name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />

                    <Input
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-300">Message</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                            rows="4"
                            className="w-full px-4 py-2.5 bg-gray-900 border border-gray-800 focus:ring-4 focus:ring-yellow-500/20 rounded-lg text-sm text-white placeholder-gray-500 outline-none transition-all duration-200"
                            placeholder="How can we help you?"
                        ></textarea>
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full text-black font-bold shadow-md shadow-yellow-500/10 cursor-pointer"
                    >
                        Send Message
                    </Button>
                </form>
            </div>
        </Layout>
    );
};
export default ContactPage;
