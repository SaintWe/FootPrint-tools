import React, { useState } from "react";
import type { DescriptionsProps, UploadProps } from 'antd';
import { Button, Descriptions, message } from 'antd';
import { DescTitle, ServiceBasic } from "./Basic";
import { CloudUploadOutlined } from "@ant-design/icons";
import Dragger from "antd/es/upload/Dragger";
import type { UploadRequestOption } from 'rc-upload/lib/interface';
import { RcFile } from "antd/es/upload";
import { XMLParser } from "fast-xml-parser";


/**
 * Desc 类型定义
 */
interface DescResultDataItem {
    key: string,
    label: JSX.Element,
    children: string,
    span: number,
}

/**
 * 初始数据
 */
const result_data_init = (): DescResultDataItem[] => [
    {
        key: 'points_before_modification',
        label: DescTitle('修改前点数'),
        children: '-',
        span: 1,
    },
    {
        key: 'points_after_modification',
        label: DescTitle('导出后点数'),
        children: '-',
        span: 1,
    },
];

/**
 * 渲染组件
 */
const Render: React.FC = () => {
    // const [form] = Form.useForm();

    // // 代码
    // const [code, setCode] = useState<string>('');

    const [descItemValue, setDescItemValue] = useState<DescResultDataItem[]>(result_data_init());
    const DescriptionsItems: DescriptionsProps['items'] = descItemValue;
    const contentStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        fontWeight: 'bold',
        color: 'darkblue',
    };

    // // 清理输入
    // const resetInput = () => {
    //     form.resetFields();
    //     resetResult();
    // };
    // 清理结果
    const resetResult = () => setDescItemValue(descItemValue.map((v: DescResultDataItem) => ({ ...v, children: '-' })));

    /**
     * 上传文件
     */
    const draggerProps: UploadProps = {
        name: 'file',
        multiple: false,
        accept: '.gpx,.GPX',
        maxCount: 1,
        async customRequest(options: UploadRequestOption<any>) {
            const file = options.file as RcFile;
            const reader = new FileReader();
            return new Promise<void>(
                (resolve, reject) => {
                    reader.readAsText(file);
                    reader.onload = async function (e) {
                        const file_content = e.target?.result ?? '';
                        // setCode(file_content as string);
                        toCSV(file_content as string);
                        resolve();
                    };
                    reader.onerror = function (e) {
                        reject(e);
                    };
                }
            );
        },
        showUploadList: false,
        onChange(info) {
            const { status } = info.file;
            if (status !== 'uploading') {
                console.log(info.file, info.fileList);
            }
            if (status === 'done') {
                message.success(`${info.file.name} file uploaded successfully.`);
            } else if (status === 'error') {
                message.error(`${info.file.name} file upload failed.`);
            }
        },
        onDrop(e) {
            message.success(`文件：${e.dataTransfer.files.item(0)?.name} 加载成功.`);
        },
    };

    const setDescItemValueFromKey = (key: string, value: string) => {
        setDescItemValue(descItemValue.map(
            (v: DescResultDataItem) => {
                if (v.key === key) {
                    v.children = value;
                }
                return v;
            }
        ))
    };

    /**
     * toCSV
     */
    const toCSV = (data: string) => {
        const Parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: ""
        })
        const xmlDoc = Parser.parse(data);
        const trkpts = xmlDoc.gpx.trk.trkseg.trkpt;
        //const trkpts = xmlDoc.gpx.trk.trkseg;

        setDescItemValueFromKey('points_before_modification', trkpts.length as string);

        let csvString = "dataTime,locType,longitude,latitude,heading,accuracy,speed,distance,isBackForeground,stepType,altitude\n";
        for (let i = 0; i < trkpts.length; i++) {
            let dataTime = Date.parse(trkpts[i].time) / 1000;
            let locType = '1';
            let longitude = trkpts[i].lon;
            let latitude = trkpts[i].lat;
            let heading = '0.000000';
            let accuracy = '0.000000'; //精确度
            let speed = trkpts[i].speed?.toFixed(6) || '0';   //速度
            let distance = '0.000000'; //间隔
            let isBackForeground = '0';
            let stepType = '0';
            let altitude = trkpts[i].ele?.toFixed(6) || '0';  //海拔

            csvString += `${dataTime},${locType},${longitude},${latitude},${heading},${accuracy},${speed},${distance},${isBackForeground},${stepType},${altitude}\n`;
        }
        setDescItemValueFromKey('points_after_modification', String(csvString.split('\n').length - 2));
        download_file(csvString, `导出轨迹_${Date.now()}.gpx`);
    }

    return (
        <>
            <div style={{ paddingBottom: 10, textAlign: 'center' }}>
                <h3>{Gpx2FootprintCsv.name}</h3>
            </div>

            <div style={{ paddingLeft: 30, paddingRight: 30 }}>
                <Dragger {...draggerProps}>
                    <p className="ant-upload-drag-icon">
                        <CloudUploadOutlined />
                    </p>
                    <p className="ant-upload-text">拖拽 GPX 文件到此处 或 <em>点击选择 GPX 文件上传</em></p>
                    <p className="ant-upload-hint">请选择文件</p>
                </Dragger>
            </div>
            <div style={{ padding: 10, textAlign: 'center' }}></div>
            <Descriptions size='small' contentStyle={contentStyle} column={2} extra={<Button onClick={() => resetResult()}>清理信息</Button>} title="信息一览" layout="vertical" bordered items={DescriptionsItems} />
        </>
    );
}


/**
 * 下载文件到本地
 */
const download_file = async (d: any, name: string) => {
    message.success('正在生成文件...', 3);
    const element = document.createElement('a');
    const file = new Blob([d], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = name;
    element.style.display = 'none';
    element.click();
};

const Gpx2FootprintCsv: ServiceBasic = {
    name: 'GPX 转足迹 CSV',
    identifier: 'Gpx2FootprintCsv',
    children: <Render />,
};

export default Gpx2FootprintCsv;
