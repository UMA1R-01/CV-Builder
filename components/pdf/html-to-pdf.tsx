
import React from 'react';
import { Text, View, StyleSheet, Link } from '@react-pdf/renderer';
import { Parser } from 'html-to-react';

const styles = StyleSheet.create({
    p: { marginBottom: 4 },
    ul: { marginTop: 4, marginBottom: 4, paddingLeft: 10 },
    ol: { marginTop: 4, marginBottom: 4, paddingLeft: 10 },
    li: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 2 },
    bullet: { width: 8, height: 8, marginRight: 5, marginTop: 4 },
    link: { color: 'blue', textDecoration: 'underline' },
    strong: { fontWeight: 'bold' },
    em: { fontStyle: 'italic' },
});

const Bullet: React.FC = () => (
    <View style={styles.bullet}>
        <Text>•</Text>
    </View>
);

const NumberedItem: React.FC<{ index: number }> = ({ index }) => (
    <View style={styles.bullet}>
        <Text>{index}.</Text>
    </View>
);

const htmlToReactParser = new Parser();

const processingInstructions = [
    {
        shouldProcessNode: (node: any) => node.type === 'tag' && ['strong', 'b'].includes(node.name),
        processNode: (node: any, children: any, index: number) => <Text key={index} style={styles.strong}>{children}</Text>,
    },
    {
        shouldProcessNode: (node: any) => node.type === 'tag' && ['em', 'i'].includes(node.name),
        processNode: (node: any, children: any, index: number) => <Text key={index} style={styles.em}>{children}</Text>,
    },
    {
        shouldProcessNode: (node: any) => node.type === 'tag' && node.name === 'a',
        processNode: (node: any, children: any, index: number) => <Link key={index} src={node.attribs.href} style={styles.link}>{children}</Link>,
    },
    {
        shouldProcessNode: (node: any) => node.type === 'tag' && node.name === 'p',
        processNode: (node: any, children: any, index: number) => <Text key={index} style={styles.p}>{children}</Text>,
    },
    {
        shouldProcessNode: (node: any) => node.type === 'tag' && node.name === 'ul',
        processNode: (node: any, children: any, index: number) => <View key={index} style={styles.ul}>{children}</View>,
    },
    {
        shouldProcessNode: (node: any) => node.type === 'tag' && node.name === 'ol',
        processNode: (node: any, children: any, index: number) => <View key={index} style={styles.ol}>{children}</View>,
    },
    {
        shouldProcessNode: (node: any) => node.type === 'tag' && node.name === 'li',
        processNode: (node: any, children: any, index: number) => {
            const isOl = node.parent && node.parent.name === 'ol';
            return (
                <View key={index} style={styles.li}>
                    {isOl ? <NumberedItem index={index + 1} /> : <Bullet />}
                    <Text>{children}</Text>
                </View>
            );
        },
    },
    {
        shouldProcessNode: (node: any) => true,
        processNode: (node: any, children: any) => <>{children}</>,
    },
];

const HtmlToPdf: React.FC<{ html: string; style?: any }> = ({ html, style }) => {
    if (!html) return null;
    const reactContent = htmlToReactParser.parseWithInstructions(html, () => true, processingInstructions);
    return <View style={style}>{reactContent}</View>;
};

export default HtmlToPdf;
