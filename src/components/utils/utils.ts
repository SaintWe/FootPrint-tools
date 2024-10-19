import type { InputRef } from "antd";
import type { FormInstance, RuleObject }  from "antd/es/form";
import { useContext } from "react";
import { TabsContext, TabsContextProps } from "../tabs/TabHome";


export const useTabs = (): TabsContextProps => {
    const context = useContext(TabsContext);
    if (!context) {
        throw new Error('useTabs must be used within a TabsProvider');
    }
    return context;
};

export interface customRule {
    float_num: RuleObject[];
    float_num_no_required: RuleObject[];
}
export type customRuleKeys = keyof customRule;

export const FromRules: customRule = {
    float_num: [
        { required: true, message: '输入不能为空' },
        { pattern: /^[-+]?\d+(\.\d{1,4})?$/, message: "只允许输入 4 位小数", }
    ],
    float_num_no_required: [
        { required: false, message: '输入不能为空' },
        { pattern: /^[-+]?\d+(\.\d{1,4})?$/, message: "只允许输入 4 位小数", },
    ],
};

/**
 * 保留 3 位小数
 */
export const num3 = (d: string | number): string => {
    // 将输入转换为数字
    const num = typeof d === 'number' ? d : parseFloat(d);
    // 保留 3 位小数并返回字符串
    return (Math.round(num * Math.pow(10, 3)) / Math.pow(10, 3)).toFixed(3);
}

/**
 * 验证是否 NaN
 */
export const isNaNs = (...d: number[]) => {
    let o = false;
    for (let i = 0; i < d.length; i++) {
        if (isNaN(d[i])) {
            o = true;
            break; 
        }
    }
    return o;
}

/**
 * Converts input to a number and checks for valid values.
 * @param input - The input value to be converted.
 * 
 * @returns The valid number or NaN if invalid.
 */
export const toValidNumber = (input: number | string | null | undefined, thenInvalid?: number): number => {
    if (typeof input === 'number') {
        return input;
    } else if (typeof input === 'string') {
        const num = parseFloat(input);
        if (isNaN(num) && typeof thenInvalid !== 'undefined') {
            return thenInvalid;
        }
        return num;
    } else if (typeof thenInvalid !== 'undefined') {
        return thenInvalid;
    } else {
        return NaN;
    }
};

/**
 * 验证是否数值
 */
export const isNum = (args: number | string | undefined | null): boolean => {
    if (args === null || args === undefined) return false;
    const str = String(args);
    if (str.length === 0) return false;
    const validNumberRegex = /^-?\d+(\.\d+)?$/;
    return validNumberRegex.test(str);
}

/**
 * 格式化 Number
 */
export const formatNumber = (n: number | string, integerPadding: number, decimalPadding: number): string => {
    const v = Number(n);
    // 将数值拆分成整数部分和小数部分
    const [integerPart, decimalPart] = Math.abs(v).toString().split('.');
    // 处理整数部分，添加前导0
    const formattedIntegerPart = integerPart.padStart(integerPadding, '0');
    // 处理小数部分，添加尾随0
    const formattedDecimalPart = (decimalPart || '').padEnd(decimalPadding, '0');
    // 组合结果，处理负数情况
    const result = formattedIntegerPart + '.' + formattedDecimalPart;
    return v < 0 ? '-' + result : '+' + result;
}


// 自动切换输入框
export const handleKeyPress = async (form: FormInstance, inputRefs: React.MutableRefObject<InputRef[]>, e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        try {
            // 获取所有字段的值
            const values = form.getFieldsValue();
            const allFieldsFilled = Object.values(values).every(value => value);
            if (allFieldsFilled) {
                // 验证表单
                await form.validateFields();
                // 所有字段都有值，直接提交
                form.submit();
            } else if (index < inputRefs.current.length - 1) {
                // 切换到下一个输入框
                inputRefs.current[index + 1].focus();
            } else {
                // 已经是最后一个则回到第一个
                inputRefs.current[0].focus();
            }
        } catch (err) {
            // 如果验证失败，不做任何操作
            // console.error(err);
        }
    }
}

