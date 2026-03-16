import {
  ListObjectsV2Command,
  GetObjectCommand,
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client
} from "@aws-sdk/client-s3";
export default class S3ClientCustom {

  constructor() { }

  async getLatestModified(bucketName: string): Promise<string> {
    const client = new S3Client({});

    const command = new ListObjectsV2Command({
      Bucket: bucketName,
    });

    try {
      let isTruncated = true;
      const fileList = []

      while (isTruncated) {
        const { Contents, IsTruncated, NextContinuationToken } = await client.send(command);

        if (Contents === null || Contents === undefined) {
          return ''
        }

        const sortedContents = Contents.sort((a, b) => {
          if (!a.LastModified || !b.LastModified) return 0;
          return b.LastModified.getTime() - a.LastModified.getTime();
        });

        sortedContents.map((c) => fileList.push(c.Key));
        isTruncated = IsTruncated;
        command.input.ContinuationToken = NextContinuationToken;
      }

      return fileList[0]
    } catch (err) {
      console.error(err);
    }
  }

  async getFileList(bucketName: string): Promise<string[]> {
    const client = new S3Client({});

    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      // The default and maximum number of keys returned is 1000. This limits it to
      // one for demonstration purposes.
      MaxKeys: 1,
    });

    try {
      let isTruncated = true;
      const fileList = []

      while (isTruncated) {
        const { Contents, IsTruncated, NextContinuationToken } = await client.send(command);

        if (Contents === null || Contents === undefined) {
          return []
        }

        Contents.map((c) => fileList.push(c.Key));
        isTruncated = IsTruncated;
        command.input.ContinuationToken = NextContinuationToken;
      }

      return fileList
    } catch (err) {
      console.error(err);
    }
  }

  async getFile(bucketName: string, fileName: string): Promise<string> {
    const client = new S3Client({});
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: fileName,
    });

    try {
      const response = await client.send(command);
      // The Body object also has 'transformToByteArray' and 'transformToWebStream' methods.
      const str = await response.Body.transformToString();

      return str
    } catch (err) {
      console.error(err);
    }
  }

  async deleteAllFiles(bucketName: string): Promise<string> {
    const fileList = await this.getFileList(bucketName)

    const client = new S3Client({});

    await Promise.all(
      fileList.map(async f => {

        const command = new DeleteObjectCommand({
          Bucket: bucketName,
          Key: f,
        });

        try {
          const response = await client.send(command);
          return response
        } catch (err) {
          console.error(err);
        }
      })
    )

    return 'success'
  }

  async putFile(bucketName: string, fileName: string, content: string): Promise<string> {
    const client = new S3Client({});

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: content,
    });

    try {
      const response = await client.send(command);
      console.log(response);
    } catch (err) {
      console.error(err);
    }

    return 'success'
  }
}