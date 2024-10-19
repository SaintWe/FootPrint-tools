import React from 'react';
import { ConfigProvider, Layout } from 'antd';
import BaseFooter from './layouts/BaseFooter';
import BaseHeader from './layouts/BaseHeader';
import BaseContent from './layouts/BaseContent';

const App: React.FC = () => {
    return (
        <Layout>
            <ConfigProvider
                theme={{
                    token: {},
                    components: {
                        Layout: {
                            headerBg: '#ffffff',
                            bodyBg: '#ffffff',
                        },
                        Tabs: {
                        }
                    },
                }}
            >
                <BaseHeader></BaseHeader>
                <BaseContent></BaseContent>
                <BaseFooter></BaseFooter>
            </ConfigProvider>
        </Layout>
    );
};

export default App;