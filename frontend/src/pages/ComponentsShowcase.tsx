import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Button,
  Input,
  Card,
  Badge,
  Tooltip,
  Checkbox,
  Radio,
  RadioGroup,
  Select,
  Dropdown,
  DropdownItem,
  DropdownDivider,
} from '@components/ui';
import { ThemeToggle } from '@components/ThemeToggle';
import { PageTransition } from '@components/PageTransition';
import { staggerContainer, staggerItem } from '@/utils/animations';

const ComponentsShowcase = () => {
  const [checked, setChecked] = useState(false);
  const [selectedRadio, setSelectedRadio] = useState('option1');
  const [selectedValue, setSelectedValue] = useState('');

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 transition-colors duration-300">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              UI Components Showcase
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              All available components with dark mode support
            </p>
          </div>
          <ThemeToggle />
        </div>
      </div>

        <motion.div
          className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Buttons */}
          <motion.div variants={staggerItem}>
            <Card variant="elevated" padding="lg" animate={false}>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Buttons
          </h2>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
            <Button isLoading>Loading...</Button>
          </div>
            </Card>
          </motion.div>

          {/* Badges */}
          <motion.div variants={staggerItem}>
            <Card variant="elevated" padding="lg" animate={false}>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Badges
          </h2>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Default</Badge>
              <Badge variant="primary">Primary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="danger">Danger</Badge>
              <Badge variant="info">Info</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge size="sm">Small</Badge>
              <Badge size="md">Medium</Badge>
              <Badge size="lg">Large</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="success" dot>
                Online
              </Badge>
              <Badge variant="danger" dot>
                Offline
              </Badge>
            </div>
          </div>
            </Card>
          </motion.div>

          {/* Inputs */}
          <motion.div variants={staggerItem}>
            <Card variant="elevated" padding="lg" animate={false}>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Inputs
          </h2>
          <div className="space-y-4">
            <Input label="Email" type="email" placeholder="Enter your email" />
            <Input
              label="Password"
              type="password"
              placeholder="Enter password"
              helperText="Must be at least 8 characters"
            />
            <Input
              label="Error State"
              type="text"
              error="This field is required"
            />
          </div>
            </Card>
          </motion.div>

          {/* Select */}
          <motion.div variants={staggerItem}>
            <Card variant="elevated" padding="lg" animate={false}>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Select
          </h2>
          <div className="space-y-4">
            <Select
              label="Choose an option"
              value={selectedValue}
              onChange={(e) => setSelectedValue(e.target.value)}
              helperText="Select one option from the list"
            >
              <option value="">Select...</option>
              <option value="option1">Option 1</option>
              <option value="option2">Option 2</option>
              <option value="option3">Option 3</option>
            </Select>
          </div>
            </Card>
          </motion.div>

          {/* Checkboxes */}
          <motion.div variants={staggerItem}>
            <Card variant="elevated" padding="lg" animate={false}>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Checkboxes
          </h2>
          <div className="space-y-4">
            <Checkbox
              label="Accept terms and conditions"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
            />
            <Checkbox
              label="Subscribe to newsletter"
              description="Get weekly updates about new features"
            />
            <Checkbox label="Disabled" disabled />
          </div>
            </Card>
          </motion.div>

          {/* Radio Buttons */}
          <motion.div variants={staggerItem}>
            <Card variant="elevated" padding="lg" animate={false}>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Radio Buttons
          </h2>
          <RadioGroup label="Choose your plan">
            <Radio
              label="Free"
              description="Perfect for getting started"
              name="plan"
              value="option1"
              checked={selectedRadio === 'option1'}
              onChange={(e) => setSelectedRadio(e.target.value)}
            />
            <Radio
              label="Pro"
              description="For professional use"
              name="plan"
              value="option2"
              checked={selectedRadio === 'option2'}
              onChange={(e) => setSelectedRadio(e.target.value)}
            />
            <Radio
              label="Enterprise"
              description="For large organizations"
              name="plan"
              value="option3"
              checked={selectedRadio === 'option3'}
              onChange={(e) => setSelectedRadio(e.target.value)}
            />
          </RadioGroup>
            </Card>
          </motion.div>

          {/* Tooltips */}
          <motion.div variants={staggerItem}>
            <Card variant="elevated" padding="lg" animate={false}>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Tooltips
          </h2>
          <div className="flex flex-wrap gap-4">
            <Tooltip content="Tooltip on top" position="top">
              <Button variant="secondary">Hover me (Top)</Button>
            </Tooltip>
            <Tooltip content="Tooltip on bottom" position="bottom">
              <Button variant="secondary">Hover me (Bottom)</Button>
            </Tooltip>
            <Tooltip content="Tooltip on left" position="left">
              <Button variant="secondary">Hover me (Left)</Button>
            </Tooltip>
            <Tooltip content="Tooltip on right" position="right">
              <Button variant="secondary">Hover me (Right)</Button>
            </Tooltip>
          </div>
            </Card>
          </motion.div>

          {/* Dropdown */}
          <motion.div variants={staggerItem}>
            <Card variant="elevated" padding="lg" animate={false}>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Dropdown
          </h2>
          <div className="flex gap-4">
            <Dropdown
              trigger={<Button variant="secondary">Open Menu</Button>}
              align="left"
            >
              <DropdownItem
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
              >
                Profile
              </DropdownItem>
              <DropdownItem
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
              >
                Settings
              </DropdownItem>
              <DropdownDivider />
              <DropdownItem
                danger
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                }
              >
                Logout
              </DropdownItem>
            </Dropdown>
          </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default ComponentsShowcase;
