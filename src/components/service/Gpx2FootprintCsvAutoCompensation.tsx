import React, { useRef, useState } from "react";
import type { DescriptionsProps, InputRef, UploadProps } from 'antd';
import { Button, Descriptions, Form, message } from 'antd';
import { DescTitle, NumberInput, ServiceBasic } from "./Basic";
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

// 计算距离的 Haversine 公式
const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // 地球半径，单位为米
    const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // 结果为米
}

/**
 * 渲染组件
 */
const Render: React.FC = () => {
    const [form] = Form.useForm();

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
        console.log(xmlDoc);
        const trkpts = xmlDoc.gpx.trk.trkseg.trkpt;

        setDescItemValueFromKey('points_before_modification', trkpts.length as string);
        console.log('点数: ' + trkpts.length);

        const title = "dataTime,locType,longitude,latitude,heading,accuracy,speed,distance,isBackForeground,stepType,altitude\n";

        let newTrkpts:string[] = [];
        const max_distance: number = form.getFieldValue('max_distance');

        for (let i = 0; i < trkpts.length - 1; i++) {
            const dataTime = Date.parse(trkpts[i].time) / 1000;
            const locType = '1';
            const longitude = trkpts[i].lon;
            const latitude = trkpts[i].lat;
            const heading = '0.000000';
            const accuracy = '0.000000'; //精确度
            const speed = trkpts[i].speed?.toFixed(6) || '0';   //速度
            const distance = '0.000000'; //间隔
            const isBackForeground = '0';
            const stepType = '0';
            const altitude = trkpts[i].ele?.toFixed(6) || '0';  //海拔

            if (i >= 1) {
                const distance = haversine(trkpts[i].lat, trkpts[i].lon, trkpts[i - 1].lat, trkpts[i - 1].lon);
                if (distance > max_distance) {
                    const before_lat = trkpts[i - 1].lat;
                    const before_lon = trkpts[i - 1].lon;
                    const before_ele = trkpts[i - 1].ele;
                    const before_speed = trkpts[i - 1].speed;
                    const before_time = trkpts[i - 1].time;
    
                    const after_lat = trkpts[i].lat;
                    const after_lon = trkpts[i].lon;
                    const after_ele = trkpts[i].ele;
                    const after_speed = trkpts[i].speed;
                    const after_time = trkpts[i].time;

                    const steps = Math.ceil(distance / max_distance);
                    for (let i = 1; i < steps; i++) {
                        const ratio = i / steps;
                        const newLatitude = parseFloat(before_lat) + ratio * (parseFloat(after_lat) - parseFloat(before_lat));
                        const newLongitude = parseFloat(before_lon) + ratio * (parseFloat(after_lon) - parseFloat(before_lon));
                        const newAltitude = (before_ele ? parseFloat(before_ele) : 0) + ratio * ((after_ele ? parseFloat(after_ele) : 0) - (before_ele ? parseFloat(before_ele) : 0));
                        const newSpeed = (before_speed ? parseFloat(before_speed) : 0) + ratio * ((after_speed ? parseFloat(after_speed) : 0) - (before_speed ? parseFloat(before_speed) : 0));
                        const newTime = Date.parse(before_time) / 1000 + ratio * (Date.parse(after_time) / 1000 - Date.parse(before_time) / 1000);

                        newTrkpts.push(`${Math.round(newTime)},${locType},${newLongitude.toFixed(6)},${newLatitude.toFixed(6)},${heading},${accuracy},${newSpeed.toFixed(6)},${distance},${isBackForeground},${stepType},${newAltitude.toFixed(6)}`);
                    }
                }
            }

            newTrkpts.push(`${dataTime},${locType},${longitude},${latitude},${heading},${accuracy},${speed},${distance},${isBackForeground},${stepType},${altitude}`);
        }

        // 生成新的 CSV 字符串
        const csvString = title + newTrkpts.join(`\n`);

        setDescItemValueFromKey('points_after_modification', String(newTrkpts.length - 2));

        download_file(csvString, `导出轨迹_${Date.now()}.gpx`);
    }

    /**
     * 表单字段类型定义
     */
    interface FieldType {
        max_distance: string;
    }
    const inputRefs = useRef<InputRef[]>([]);


    return (
        <>
            <div style={{ paddingBottom: 10, textAlign: 'center' }}>
                <h3>{Gpx2FootprintCsvAutoCompensation.name}</h3>
            </div>

            <div style={{ paddingLeft: 30, paddingRight: 30 }}>
                <Dragger {...draggerProps}>
                    <p className="ant-upload-drag-icon">
                        <CloudUploadOutlined />
                    </p>
                    <p className="ant-upload-text">拖拽 GPX 文件到此处 或 <em>点击选择 GPX 文件上传</em></p>
                    <p className="ant-upload-hint">请设置后再加载文件</p>
                </Dragger>
            </div>
            <div style={{ padding: 10, textAlign: 'center' }}></div>
            <Descriptions size='small' contentStyle={contentStyle} column={2} extra={<Button onClick={() => resetResult()}>清理信息</Button>} title="信息一览" layout="vertical" bordered items={DescriptionsItems} />
            <div style={{ padding: 10 }}></div>
            <Form
                form={form}
                name={Gpx2FootprintCsvAutoCompensation.identifier + Date.now()}
                // onFinish={onFinish}
                // onFinishFailed={onFinishFailed}
                autoComplete="off"
                layout="vertical"
                scrollToFirstError
            >
                <div className='input-box-container'>
                    <div className='input-box-3'>
                        <Form.Item<FieldType>
                            label="两点间距阈值/米"
                            name="max_distance"
                            tooltip='超过此距离的两点将自动插入新点'
                        >
                            {NumberInput(form, inputRefs, 0)}
                        </Form.Item>
                    </div>
                </div>

            </Form>
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

const Gpx2FootprintCsvAutoCompensation: ServiceBasic = {
    name: 'GPX 转足迹 CSV 自动补偿',
    identifier: 'Gpx2FootprintCsvAutoCompensation',
    children: <Render />,
};

export default Gpx2FootprintCsvAutoCompensation;
