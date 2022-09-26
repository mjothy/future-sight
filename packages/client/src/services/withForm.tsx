import { Form } from 'antd';

export default function withForm(WrappedComponent) {
  const ComponentWithTheme = (props) => {
    const [form] = Form.useForm();
    return <WrappedComponent form={form} {...props} />;
  };

  const displayName =
    WrappedComponent.displayName || WrappedComponent.name || 'Component';
  ComponentWithTheme.displayName = `withForm(${displayName})`;

  return ComponentWithTheme;
}
