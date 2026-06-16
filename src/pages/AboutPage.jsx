import React from 'react';
import { Layout } from '../components/layout/Layout';

export const AboutPage = () => {
    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-6">
                    About <span className="text-yellow-500">Sarker Live TV</span>
                </h1>
                <div className="space-y-6 text-gray-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
                    <p>
                        Sarker Live TV is a state-of-the-art live streaming aggregator that allows users to instantly discover and tune into TV channels from around the world.
                    </p>
                    <p>
                        We use advanced media delivery protocols to offer seamless, buffer-free playback of your favorite news, sports, entertainment, and documentary channels.
                    </p>
                    <p>
                        This is a placeholder page. You can customize the details here as needed.
                    </p>
                </div>
            </div>
        </Layout>
    );
};
export default AboutPage;
