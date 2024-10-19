import { Button, Flex, Popover, Tabs } from "antd";
import React, { useState, createContext, ReactNode } from 'react';
import { ServiceBasic } from "../service/Basic";
import { useTabs } from "../utils/utils";
import Gpx2FootprintCsv from "../service/Gpx2FootprintCsv";
import Gpx2FootprintCsvAutoCompensation from "../service/Gpx2FootprintCsvAutoCompensation";

/**
 * 标签页激活的 KEY
 */
type TargetKey = React.MouseEvent | React.KeyboardEvent | string;

/**
 * 引入所有计算服务
 */
const defaultTabsButton: ServiceBasic[] = [
    Gpx2FootprintCsv,
    Gpx2FootprintCsvAutoCompensation,
];

/**
 * Tab Home 页，包含引入的所有计算服务按钮
 */
const TabHome: React.FC = () => {
    const { addTab } = useTabs();
    return (
        <div style={{ padding: 30 }}>
            <Flex wrap gap="small" justify="center">
                {defaultTabsButton.map((item: ServiceBasic) => {
                    return <Button key={item.identifier} onClick={() => addTab(item)} >{item.name}</Button>;
                })}
            </Flex>
        </div>
    );
}

interface Tab {
    key: string;
    label: string;
    closable: boolean;
    children: ReactNode;
}

export interface TabsContextProps {
    tabs: Tab[];
    setTabs: React.Dispatch<React.SetStateAction<Tab[]>>;
    activeKey: string;
    setActiveKey: React.Dispatch<React.SetStateAction<string>>;
    addTab: (item: ServiceBasic) => void;
    removeTab: (targetKey: TargetKey) => void;
    onEdit: (targetKey: TargetKey, action: 'add' | 'remove') => void;
    onChange: (key: string) => void;
}

export const TabsContext = createContext<TabsContextProps | undefined>(undefined);

export const TabsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const homeTab: Tab = {
        key: "home",
        label: "选择操作",
        closable: false,
        children: <TabHome />,
    };
    const [tabs, setTabs] = useState<Tab[]>([homeTab,]);
    const [activeKey, setActiveKey] = useState<string>('home');

    // 添加标签
    const addTab = (item: ServiceBasic) => {
        // 存在 home 标签则删除
        const newTabs: Tab[] = tabs.filter((v) => v.key !== 'home');
        const key: string = `${item.identifier}_${Date.now()}`;
        setTabs([
            ...newTabs,
            {
                label: item.name + ('(' + newTabs.length + ')'),
                closable: true,
                children: <div style={{ padding: 15 }}>{item.children}</div>,
                key: key,
            }
        ]);
        setActiveKey(key);
    };

    // 删除标签
    const removeTab = (targetKey: TargetKey) => {
        const targetIndex: number = tabs.findIndex((pane) => pane.key === targetKey);
        const newTabs: Tab[] = tabs.filter((pane) => pane.key !== targetKey);
        // 如果删除的是激活的标签，并且删除后标签数量不为0，则变更激活的标签为前一个
        if (newTabs.length && targetKey === activeKey) {
            const { key } = newTabs[targetIndex === newTabs.length ? targetIndex - 1 : targetIndex];
            setActiveKey(key);
        }
        if (newTabs.length === 0) {
            setTabs([homeTab,]);
            setActiveKey('home');
        } else {
            setTabs(newTabs);
        }
    };

    // 编辑标签
    const onEdit = (targetKey: TargetKey, action: 'add' | 'remove') => {
        if (action === 'add') {
            setActiveKey('home');
        } else {
            removeTab(targetKey);
        }
    };

    // 变更标签
    const onChange = (key: string) => {
        setActiveKey(key);
    };

    return (
        <TabsContext.Provider value={{ tabs, setTabs, activeKey, setActiveKey, addTab, removeTab, onEdit, onChange }}>
            {children}
        </TabsContext.Provider>
    );
};





const TabBase: React.FC = () => {
    const { addTab, tabs, activeKey, onChange, onEdit }: TabsContextProps = useTabs();

    const content = (
        <div style={{ padding: 5 }}>
            <Flex vertical wrap gap="small" justify="center">
                {defaultTabsButton.map((item: ServiceBasic) => {
                    return <Button key={item.identifier} onClick={() => addTab(item)} >{item.name}</Button>;
                })}
            </Flex>
        </div>
    );

    const operations: JSX.Element = (
        <Popover placement="leftTop" content={content} title="选择操作">
            <Button autoInsertSpace={false} type="primary">添加</Button>
        </Popover>
    );

    return (
        <>
            <Tabs
                hideAdd
                onChange={onChange}
                activeKey={activeKey}
                type="editable-card"
                onEdit={onEdit}
                items={tabs}
                tabBarExtraContent={operations}
                style={{ padding: 15 }}
            />
        </>
    );
}

export default TabBase;


