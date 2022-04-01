import { GetObjectAttributesCommand, GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3"

export class S3Provider {
    constructor(client) {
        this.client = client;
        this.listFiles = this.listFiles.bind(this);
        this.readFile = this.readFile.bind(this);
        this.readFileMetadata = this.readFileMetadata.bind(this);
        this.parseS3Path = this.parseS3Path.bind(this);
    }

    listFiles(path) {
        const { bucket, key } = this.parseS3Path(path);
        let keys = [];

        const s3Response = await this.client.send(
            new ListObjectsV2Command({
                Bucket: bucket,
                Prefix: key,
            })
        )
        
        keys = keys.concat(
            s3Response.Contents.map(content => content.Key)
        );

        return keys;
    }

    async readFile(path) {
        const { bucket, key } = this.parseS3Path(path);
        const s3Response = await this.client.send(
          new GetObjectCommand({
            Bucket: bucket,
            Key: key,
          })
        );
        return s3Response.Body;
    }

    readFileMetadata(path) {
        const { bucket, key } = this.parseS3Path(path);
        const s3Response = await this.client.send(
            new GetObjectAttributesCommand({
                Bucket: bucket,
                Key: key,
            })
        );
        return s3Response;
    }

    parseS3Path(path) {
        const delimiter = '/';
        const parts = path.replace('s3://', '').split(delimiter);
        const bucket = parts.shift();
        const key = parts.join(delimiter);
        return { bucket, key };
    }
}