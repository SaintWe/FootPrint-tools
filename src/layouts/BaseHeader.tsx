import React from 'react';
import { Affix, Col, Row } from "antd";
import { Header } from "antd/es/layout/layout";

const BaseHeader: React.FC = () => {
    return (
        <Header style={{ textAlign: 'center' }}>
            <Affix offsetTop={20}>
                <Row>
                    <Col flex={2}>
                    </Col>
                    <Col>
                        <h2 style={{ fontFamily: 'LXGW WenKai Mono Screen' }}>足迹 - 工具集</h2>
                    </Col>
                    <Col flex={2}>
                    </Col>
                </Row>
            </Affix>
        </Header>
    );
}

export default BaseHeader;
