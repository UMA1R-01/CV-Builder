
import React from 'react';
import { Text, View, Link } from '@react-pdf/renderer';
import { ProcessNodeDefinitions } from 'html-to-react';

export const processingInstructions = [
  {
    shouldProcessNode: (node: any) => node.tagName === 'p',
    processNode: (node: any, children: any) => {
      return <Text style={{ marginBottom: 10 }}>{children}</Text>;
    },
  },
  {
    shouldProcessNode: (node: any) => node.tagName === 'ul',
    processNode: (node: any, children: any) => {
      return <View>{children}</View>;
    },
  },
  {
    shouldProcessNode: (node: any) => node.tagName === 'li',
    processNode: (node: any, children: any) => {
      return (
        <View style={{ flexDirection: 'row', marginBottom: 5 }}>
          <Text style={{ marginRight: 5 }}>•</Text>
          <Text>{children}</Text>
        </View>
      );
    },
  },
  {
    shouldProcessNode: (node: any) => node.tagName === 'a',
    processNode: (node: any, children: any) => {
      return <Link src={node.attribs.href}>{children}</Link>;
    },
  },
  {
    shouldProcessNode: () => true,
    processNode: new ProcessNodeDefinitions().processDefaultNode,
  },
];
