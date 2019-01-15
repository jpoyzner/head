import React from 'react';
import { mount } from 'enzyme';
import renderer from 'react-test-renderer';
import SimpleSelect from './SimpleSelect.jsx';

test('SimpleSelect renders', () => {
  const component = renderer.create(<SimpleSelect options={[]} />);
  expect(component.toJSON()).toMatchSnapshot();
});

test('SimpleSelect renders with string options array', () => {
  const options = ['A', 'B', 'C'];
  const value = 'C';

  const jsx = <SimpleSelect options={options} value={value} />;
  let component = renderer.create(jsx);
  expect(component.toJSON()).toMatchSnapshot();

  component = mount(jsx);
  expect(component.find('option').length).toBe(options.length);
  expect(component.state().value).toBe('C');
  // set props since component is now using getDerivedStateFromProps
  component.setProps({value: 'A'})
  component.simulate('change', { target: { value: 'A' } });
  expect(component.state().value).toBe('A');
  component.setProps({value: 'B'})
  component.simulate('change', { target: { value: 'B' } });
  expect(component.state().value).toBe('B');
});

test('SimpleSelect renders with object options array', () => {
  const value = '2';
  const options =
    [{ label: 'A', value: '1' }, { label: 'B', value: '2' }, { label: 'C', value: '3' }];

  const jsx = <SimpleSelect options={options} value={value} />;
  let component = renderer.create(jsx);
  expect(component.toJSON()).toMatchSnapshot();

  component = mount(jsx);
  // set props since component is now using getDerivedStateFromProps
  component.setProps({value: '2'})
  expect(component.find('option').length).toBe(options.length);
  expect(component.state().value).toBe('2');
  // set props since component is now using getDerivedStateFromProps
  component.setProps({value: '3'})
  component.simulate('change', { target: { value: '3' } });
  expect(component.state().value).toBe('3');
});
