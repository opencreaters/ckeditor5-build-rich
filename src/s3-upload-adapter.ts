import { FileLoader, UploadAdapter, UploadResponse } from "@ckeditor/ckeditor5-upload";
import { type Editor } from 'ckeditor5/src/core';
import { Subscription } from "rxjs";
import { Observable } from 'rxjs';

export class S3UploadAdapter implements UploadAdapter {
    private loader: FileLoader;
    private subs!: Subscription
    private editor!: Editor

    constructor(loader: FileLoader, editor: Editor) {
        // The file loader instance to use during the upload.
        this.loader = loader;
        this.editor = editor;
    }

    upload(): Promise<UploadResponse> {
        return this.loader.file
            .then((file: File | null) => new Promise((resolve, reject) => {
                if (file) {
                    S3Client.init(this.editor.config.get('aws_upload'))
                    const progressCallback = (progress: { total: number | null; uploaded: number; }) => {
                        this.loader.uploadTotal = progress.total;
                        this.loader.uploaded = progress.uploaded;
                    };
                    this.subs = S3Client.uploadToS3(file, `${Date.now()}--${file.name}`, progressCallback)
                        .subscribe(url => resolve({ default: url }), error => reject(error))
                }
            }));
    }

    abort() {
        this.subs?.unsubscribe();
    }
}
class S3Client {
    static s3Client: any;
    static config: any;

    static init(config: any): void {
        if (!this.s3Client && config) {
            this.config = config;
            AWS.config.update({
                region: this.config.region,
                credentials: new AWS.CognitoIdentityCredentials({ IdentityPoolId: this.config.identityPoolId })
            });
            AWS.config.correctClockSkew = true;
            this.s3Client = new AWS.S3({ apiVersion: 'latest', params: { Bucket: this.config.aws_bucket } });
        }
    }

    static uploadToS3(file: File, fileName: string, progressCallback?: any): Observable<any> {
        const Bucket = `${this.config.aws_bucket}/codejudge-s3-cognito/ckeditor`;
        return new Observable(observer => {
            if (progressCallback) { progressCallback({ total: file.size, uploaded: 0, percent: 0 }); }
            this.s3Client.upload({ Body: file, ACL: this.config.access_acl, Bucket, Key: fileName }, (error: any, data: any) => {
                if (error) {
                    error = { message: 'Something went wrong. Please try again!', ...error };
                    observer.error(error.message);
                } else {
                    observer.next(data.Location);
                    observer.complete();
                }
            }).on('httpUploadProgress', (data: { loaded: number; total: number; }) => {
                if (progressCallback) {
                    const percent = (data.loaded / data.total) * 100;
                    progressCallback({ total: data.total, uploaded: data.loaded, percent: Math.round(percent * 100 + Number.EPSILON) / 100 });
                }
            });
        });
    }
}