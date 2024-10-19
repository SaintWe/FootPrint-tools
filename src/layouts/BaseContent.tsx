import React from 'react';
import { Col, Row, theme } from 'antd';
import { Content } from "antd/es/layout/layout";
import TabBase, { TabsProvider } from '../components/tabs/TabHome';

const BaseContent: React.FC = () => {
    const { colorBgContainer } = theme.useToken().token;

    return (
        <Content style={{ backgroundColor: colorBgContainer, paddingTop: 20 }}>
            <TabsProvider>
                <Row justify='center'>
                    <Col xs={24} sm={24} md={22} lg={20} xl={16} xxl={14}>
                        <TabBase />
                    </Col>
                </Row>
            </TabsProvider>
        </Content>
    );
};

export default BaseContent;
