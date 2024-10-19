import { Input, type FormItemProps, InputRef } from "antd";
import type { FormInstance, RuleObject } from "antd/es/form";
import type { ReactNode } from "react";
import { FromRules, customRuleKeys, handleKeyPress } from "../utils/utils";

export interface ServiceBasic {
    name: string;
    identifier: string;
    children: ReactNode;
}


export interface FormItemInitParam {
    rule?: customRuleKeys | RuleObject[],
    tooltip?: string,
}

export const FormItemInit = (param?: FormItemInitParam): FormItemProps => {
    const result = {
        tooltip: FromRules.float_num[1].message,
        rules: FromRules.float_num
    };
    if (param) {
        if (param.rule) {
            if (Array.isArray(param.rule)) {
                result.rules = param.rule;
            } else if (FromRules[param.rule]) {
                result.rules = FromRules[param.rule];
            }
        }
        if (param.tooltip) {
            result.tooltip = param.tooltip;
        }
    }
    return result;
};

export const DescTitle = (s: string): JSX.Element => <div className="desc-title-item">{s}</div>;

export const DescTitleSmall = (s: string): JSX.Element => <div className="desc-title-small-item">{s}</div>;

export const NumberInput = (form: FormInstance, inputRefs: React.MutableRefObject<InputRef[]>, i: number) => <Input allowClear inputMode='numeric' ref={(el: InputRef) => (inputRefs.current[i] = el)} onPressEnter={(e) => handleKeyPress(form, inputRefs, e, i)} type='number' placeholder="请输入" />

export const Highlight = (code: string) => <div style={{  margin: '.5em 0', borderRadius: '.3em', backgroundColor: '#272822' }}><pre><div className="pre-mac"><span></span><span></span><span></span></div><code className="language-gcode line-numbers" data-prismjs-copy="拷贝代码">{code}</code></pre></div>;
