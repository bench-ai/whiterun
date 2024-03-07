import React, {FC} from 'react';
import {Dropdown, InputNumber, Menu, Slider, Switch} from "antd";
import {ModelHeader} from "./generatorColumn.styles";
import {Generator, GeneratorsMap, Option, updateGenerator} from "../../../state/generator/generatorSlice";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../../state/store";
import {DownOutlined} from "@ant-design/icons";

interface SettingModal {
    id: number
    data: Option[]
}

interface SettingOption{
    id: number
    pos: number
    option: Option
}

const SettingOption: FC<SettingOption> = ({id, option, pos}) => {

    const generatorMap = useSelector((state: RootState) => state.generator.value);
    const dispatch = useDispatch();

    const getSetting = (): [Generator, Option[]] =>{
        const generator = generatorMap[id]
        const setting = generator.settings

        const optArr:Option[] = []
        setting.forEach((opt) =>{
            const newOpt = {
                ...opt
            }
            optArr.push(newOpt)
        })

        const gen = {
            ...generator,
            setting: optArr
        }

        return [gen, optArr]
    }

    const updateSetting = (gen: Generator) =>{
        const genMap: GeneratorsMap = {}
        genMap[id] = gen
        dispatch(updateGenerator(genMap))
    }

    const updateSwitch = (value: boolean) => {
        const dataArr = getSetting()
        const gen = dataArr[0]
        const opt = dataArr[1]

        opt[pos].on = value
        gen.settings = opt
        updateSetting(gen)
    };

    const updateRange = (value: number) => {
        const dataArr = getSetting()
        const gen = dataArr[0]
        const opt = dataArr[1]

        opt[pos].value = value
        gen.settings = opt

        updateSetting(gen)
    };

    const updateNumBox = (value: number | null) => {
        const dataArr = getSetting()
        const gen = dataArr[0]
        const opt = dataArr[1]

        if (value === null){
            opt[pos].value = undefined
        }else{
            opt[pos].value = value
        }

        gen.settings = opt
        updateSetting(gen)
    };

    const updateList = (value: string) => {
        const dataArr = getSetting()
        const gen = dataArr[0]
        const opt = dataArr[1]

        const options = opt[pos].options
        if (options){
            const filterArr = options.filter((val) => val != value);
            opt[pos].options = [value].concat(filterArr)
        }

        gen.settings = opt
        updateSetting(gen)
    };

    let data;
    if (option.type === "range") {
        data = <Slider defaultValue={option.def}
                       value={option.value}
                       min={option.start}
                       max={option.stop}
                       step={option.stop === 1 ? 0.1 : undefined}
                       onChange={(value) => updateRange(value, )}/>


    } else if(option.type === "numbox"){
        data = <InputNumber min={option.start}
                            max={option.stop}
                            value={option.value}
                       onChange={(value) => updateNumBox(value, )}/>

    }else if(option.type === "switch"){
        data = <Switch
            defaultChecked={option.on}
            onChange={(value) => updateSwitch(value, )}/>

    }else if((option.type === "list") && option.options){
        const menu = (
            <Menu onClick={({ key }) => updateList(key, )}>
                {option.options.map((obj) => (
                <Menu.Item key={obj}>{obj}</Menu.Item>
                ))}
            </Menu>
        );

        data = <Dropdown.Button overlay={menu} icon={<DownOutlined/>}>
                    <span
                        className="ant-dropdown-link"
                        onClick={e => e.preventDefault()}>
                        {option.options[0]}
                    </span>
        </Dropdown.Button>
    }
    return (
        <div
            style={{width: 250, marginTop: 20, marginLeft: 20}}>
            <ModelHeader style={{marginTop: -20, borderBottom: 1}}>{option.name}</ModelHeader>
            <div>
                {data}
            </div>
        </div>);
}


const SettingModal: FC<SettingModal> = ({data, id }) => {

    return <div>
        {data.map((obj, index) => (
            <SettingOption
                id={id}
                option={obj}
                pos={index}
            />
        ))}
    </div>
};
export default SettingModal;