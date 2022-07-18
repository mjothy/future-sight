import { Component } from 'react'
import AddButton from './actions/AddButton'

// Button view: 
// Output the Type block selected ---> DashboardSidebar
// Responsability: send the block type that the user choise

const actions = [{
  label: "Add data block", type: "data"
},
{
  label: "Add text block", type: "text"
},
{
  label: "Add control block", type: "control"
}


]
export default class ActionsSidebar extends Component<any,any> {
  
  constructor(props) {
    super(props);
 }

  addBlock = (type) => {
    console.log("call add block")
    this.props.formAddBlock(type);
  }
  render() {
    return (
        <div>
          {
            // eslint-disable-next-line react/jsx-key
            actions.map((action)=> <AddButton label={action.label} type={action.type}
            addBlock = {() => this.addBlock(action.type)} />)
          }
        </div>
    )
  }
}
