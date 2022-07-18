import { Component } from 'react'
import { Menu, Button, Dropdown, Space } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import Item from 'antd/lib/list/Item';

export default class DashboardNavbar extends Component<any,any> {

  constructor(props) {
    super(props);
  }
 menu = () => {
    console.log("props: ", this.props)
    let menuItems = new Array<any>();
    if(!this.props.isSubmited){
      menuItems = [
        {
          label: 'Cancel',
          key: '1'
        }
      ]
    }else {
      menuItems = [
        {
          label: 'return',
          key: '1'
        }
      ]
    }
    return <Menu
    items={ menuItems } />
  
  }
  render() {
    return <Menu
            theme="dark"
            mode="horizontal"
            style={{ padding: '0 50px', justifyContent: 'flex-end' }}
            >
              <Item style={{ float: 'right' }}>
                <Dropdown overlay={this.menu()}>
                  <Button>
                    <Space>
                      <MenuOutlined />
                    </Space>
                  </Button>
                </Dropdown>
              </Item>
          </Menu>
  }
}
