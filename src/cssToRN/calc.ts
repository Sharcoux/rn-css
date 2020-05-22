type Group = {
  type: 'group';
  right?: Element;
  parent?: Node;
}

type Operator = {
  type: 'additive' | 'multiplicative';
  parent: Node;
  priority: 1 | 2;
  operation: '*' | '/' | '+' | '-';
  left: Element;
  right?: Element;
}

type Value = {
  type: 'number';
  value: string;
}

type Node = Group | Operator;
type Element = Node | Value;

/** Evaluate the string operation without relying on eval */
export default function calculate (string: string) {
  function applyOperator (left: number, op: Operator['operation'], right: number): number {
    if (op === '+') return left + right
    else if (op === '-') return left - right
    else if (op === '*') return left * right
    else if (op === '/') return left / right
    else return right || left
  }
  function evaluate (root: Element): number {
    switch (root.type) {
      case 'group': return evaluate(root.right!)
      case 'additive':
      case 'multiplicative':
        return applyOperator(evaluate(root.left), root.operation, evaluate(root.right!))
      case 'number': return parseFloat(root.value)
    }
  }
  const rootNode: Group = { type: 'group' }
  let currentNode: Node = rootNode
  function openGroup () {
    const newGroup: Group = { type: 'group', parent: currentNode }
    currentNode.right = newGroup
    currentNode = newGroup
  }
  function closeGroup () {
    while (currentNode.type !== 'group') currentNode = currentNode.parent!
    currentNode = currentNode.parent!
  }
  function addNumber (char: string) {
    const currentNumber = currentNode.right as (Value | undefined)
    if (currentNumber === undefined) currentNode.right = { type: 'number', value: char }
    else currentNumber.value += char
  }
  function addOperator (char: Operator['operation']) {
    const additive = '+-'.includes(char)
    const priority = additive ? 1 : 2
    // If it is a sign and not an operation, we add it to the comming number
    if (additive && !currentNode.right) return addNumber(char)
    while ((currentNode as Operator).priority && ((currentNode as Operator).priority >= priority)) currentNode = currentNode.parent!

    const operator: Operator = {
      type: additive ? 'additive' : 'multiplicative',
      priority,
      parent: currentNode,
      operation: char,
      left: currentNode.right!
    }

    currentNode.right = operator
    currentNode = operator
  }
  string.split('').forEach(char => {
    if (char === '(') openGroup()
    else if (char === ')') closeGroup()
    else if ('0123456789.'.includes(char)) addNumber(char)
    else if ('+*-/'.includes(char)) addOperator(char as Operator['operation'])
  })
  return evaluate(rootNode)
}
