import React, { Component } from 'react';
import { getApprovedTransaction, updateRoad } from './facade/adminFacade'
import { Button, Table, Row, Col, Modal, Form, ListGroup } from 'react-bootstrap';



export default class AdminPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      transactions: [],
      selectedTransaction: null
    }
  }

  async componentWillMount() {
    this.getTransactions();
    setInterval(() => {
      this.getNewTansAndUpdateSelected();
    }, 1000 * 10);
  }

  getTransactions = async () => {
    let transactions = await getApprovedTransaction();
    this.setState({ transactions });
  }


  getNewTansAndUpdateSelected = async () => {
    await this.getTransactions();
    if (this.state.selectedTransaction) {
      let newSelectedTranactions = this.state.transactions.find(e => e._id == this.state.selectedTransaction._id);
      this.setState({ selectedTransaction: newSelectedTranactions });
    }
  }

  selectTransaction = (transaction) => {
    this.setState({ selectedTransaction: transaction });
  }



  render() {
    return (
      <div>
        <Row>
          <Col xs={4}>
            <DetailTransaction transaction={this.state.selectedTransaction} />
          </Col>
          <Col xs={5}>
            <TransactionTable detailsCallback={this.selectTransaction} transactions={this.state.transactions} />
          </Col>
          <Col xs={3}>
            <EditRoute refreshTrans={this.getNewTansAndUpdateSelected} />
          </Col>
        </Row>
      </div>
    )
  }
}

class EditRoute extends Component {
  constructor(props) {
    super(props);
    this.state = {
      from: "",
      to: "",
      time: ""
    }
  }

  handleEdit = async () => {
    let response = await updateRoad(this.state);
    let { refreshTrans } = this.props;
    await refreshTrans()
  }

  render() {
    return (
      <div>
        <Form>
          <Form.Group controlId="formBasicEmail">
            <Form.Label>From</Form.Label>
            <Form.Control
              onChange={(e) => this.setState({ from: e.target.value })}
              value={this.state.from}
              type="text"
              placeholder="From" />
          </Form.Group>

          <Form.Group controlId="formBasicEmail">
            <Form.Label>To</Form.Label>
            <Form.Control
              onChange={(e) => this.setState({ to: e.target.value })}
              value={this.state.to}
              type="text"
              placeholder="To" />
          </Form.Group>

          <Form.Group controlId="formBasicEmail">
            <Form.Label>Time</Form.Label>
            <Form.Control
              onChange={(e) => this.setState({ time: e.target.value })
              }
              value={this.state.time}
              type="number"
              placeholder="Time" />
          </Form.Group>

          <Button onClick={this.handleEdit}>
            Edit
          </Button>
        </Form>
      </div>
    )
  }

}

function DetailTransaction({ transaction }) {
  if (!transaction) {
    return null;
  }

  let productList = transaction.order.products.map(e => <ListGroup.Item> {e.product} {e.size} {e.price} </ListGroup.Item>);
  let routeList = transaction.order.route.map(e => <ListGroup.Item> {e.from} - {e.to} {e.time} </ListGroup.Item>);

  return (
    <div>
      <Row>
        <Col xs={6}>
          <h3>Products</h3>
          <ListGroup>
            {productList}
          </ListGroup>
        </Col>
        <Col xs={6}>
          <h3>Route</h3>
          <ListGroup>
            {routeList}
          </ListGroup>
        </Col>
      </Row>
    </div>
  )
}

function TransactionTable({ transactions, detailsCallback }) {
  let transactionsTable = transactions.map((trans, index) => {
    return (
      <tr key={index}>
        <td> {trans.order.name} </td>
        <td> {trans.transaction.amount} </td>
        <td> {trans.order.cityTo} </td>
        <td> {trans.order.phoneNumber} </td>
        <td> {new Date(trans.transaction.date).toLocaleDateString()} </td>
        <td> <Button onClick={(event) => {
          event.preventDefault();
          detailsCallback(trans);
        }} >Details</Button> </td>
      </tr>
    )
  })
  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>To</th>
          <th>Amount</th>
          <th>City To</th>
          <th>Phone number</th>
          <th>Date</th>
          <th>Details</th>
        </tr>
      </thead>
      <tbody>
        {transactionsTable}
      </tbody>
    </Table>
  );
}