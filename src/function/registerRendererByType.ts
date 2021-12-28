// import {registerFormItem, registerOptionsControl, registerRenderer} from 'amis';
import { FormItem, OptionsControl, Renderer } from 'amis';
// @ts-ignore
import { createJQComponent } from '../frameworkFactory/jqFactory';
// @ts-ignore
import { createVue2Component } from '../frameworkFactory/vueFactory';
// @ts-ignore
// import {createVue3Component} from '../frameworkFactory/vue3Factory';
import {
  getFramework,
  Framework,
  addCutomPrefixType,
  isString,
  consoleTag,
} from '../utils';

/**
 * 自定义editor插件配置项
 */
export interface AmisRendererOption {
  /**
   * 渲染器名称
   * 备注：渲染过程中用于查找对应的渲染器
   */
  type: string;

  /**
   * 要注册的amis渲染器类型
   * amis普通渲染器、amis表单渲染器、amis表单控件渲染器
   * 备注：默认为amis普通渲染器
   */
  usage?: string;

  /**
   * 自定义组件权重
   * 备注：权重值越大则优先查找
   */
  weight?: number;

  /**
   * 自定义组件技术栈类型
   * 备注：默认为react
   */
  framework?: string;
}

export enum Usage {
  renderer = 'renderer',
  formitem = 'formitem',
  options = 'options',
}

/**
 * registerRendererByType: 根据type类型注册amis普通渲染器、amis表单渲染器、amis表单控件渲染器
 *【方法参数说明】
 * newRenderer: 新的渲染器,
 * rendererOption: {
 *   type: 渲染器的type类型，比如：input、text-area、select-user等
 *   usage?: amis普通渲染器、amis表单渲染器、amis表单控件渲染器
 *   weight?: 自定义组件权重
 *   framework?: 技术栈类型，默认为 react 技术栈，可选技术栈：vue2、react、jquery
 * }
 * 备注：暂不支持 vue3.0 技术栈
 */
export function registerRendererByType(
  newRenderer: any,
  rendererOption: string | AmisRendererOption,
) {
  if (!newRenderer) {
    return;
  }
  // 1.默认注册配置参数
  const curRendererOption: AmisRendererOption = {
    type: '',
    usage: Usage.renderer, // 默认为 amis普通渲染器
    weight: 0,
    framework: Framework.react, // 默认为 react 技术栈
  };
  // 2.获取相关配置参数
  if (rendererOption && isString(rendererOption)) {
    // rendererOption为字符串则将其设置为type
    Object.assign(curRendererOption, {
      type: rendererOption,
    });
  } else {
    Object.assign(curRendererOption, rendererOption);
  }

  if (curRendererOption && !curRendererOption.type) {
    console.error(
      `${consoleTag}自定义组件注册失败，自定义组件类型（type）不能为空。`,
    );
  } else {
    // 增加NpmCustom前缀
    curRendererOption.type = addCutomPrefixType(curRendererOption.type);
    // 修复framework数值
    curRendererOption.framework = getFramework(curRendererOption.framework);
    // 当前支持注册的渲染器类型
    const registerMap: any = {
      renderer: Renderer,
      formitem: FormItem,
      options: OptionsControl,
    };

    // 当前支持的技术栈类型
    const resolverMap: any = {
      react: (i: any) => i,
      vue2: createVue2Component,
      vue3: createVue2Component, // createVue3Component,
      jquery: createJQComponent,
    };
    // 支持多技术栈
    const curRendererComponent =
      resolverMap[curRendererOption.framework](newRenderer);
    // 注册amis渲染器
    if (!registerMap[curRendererOption.usage || 'renderer']) {
      console.error(
        `${consoleTag}自定义组件注册失败，不存在${curRendererOption.usage}自定义组件类型。`,
      );
    } else {
      registerMap[curRendererOption.usage || 'renderer']({
        type: curRendererOption.type,
        weight: curRendererOption.weight,
      })(curRendererComponent);
      // 记录当前创建的amis自定义组件
      console.info('注册了一个自定义amis组件:', {
        type: curRendererOption.type,
        weight: curRendererOption.weight,
        component: curRendererComponent,
        framework: curRendererOption.framework,
        usage: curRendererOption.usage,
      });
    }
  }
}